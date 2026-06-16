import { Request, Response } from "express";
import { prisma } from "../prisma";
import { AuthRequest } from "../middlewares/auth";

export const createOrganization = async (req: Request, res: Response): Promise<void> => {
  const { name, slug } = req.body;
  // @ts-ignore
  const userId = req.user?.id;

  try {
    const existingOrg = await prisma.organization.findUnique({ where: { slug } });
    if (existingOrg) {
      res.status(400).json({ error: "Organization with this slug already exists" });
      return;
    }

    const organization = await prisma.organization.create({
      data: {
        name,
        slug,
        members: {
          create: {
            userId,
            role: "OWNER",
          },
        },
        departments: {
          create: {
            name: "General"
          }
        },
        categories: {
          create: {
            name: "General"
          }
        }
      },
      include: {
        members: true,
      },
    });

    res.status(201).json({ message: "Organization created successfully", organization });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error creating organization" });
  }
};

export const getOrganizations = async (req: Request, res: Response): Promise<void> => {
  // @ts-ignore
  const userId = req.user?.id;

  try {
    const organizations = await prisma.organization.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        members: {
          where: { userId },
          select: { role: true },
        },
      },
    });

    res.json(organizations);
  } catch (error) {
    res.status(500).json({ error: "Server error fetching organizations" });
  }
};

export const getOrganizationMembers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const members = await prisma.member.findMany({
      where: { organizationId: req.organizationId as string },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    const users = members.map((m) => ({
      id: m.user.id,
      name: m.user.name,
      email: m.user.email,
      role: m.role
    }));

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Server error fetching organization members" });
  }
};

