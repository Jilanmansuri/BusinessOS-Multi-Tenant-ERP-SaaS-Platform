import { Response } from "express";
import { prisma } from "../prisma";
import { AuthRequest } from "../middlewares/auth";

export const getDepartments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const departments = await prisma.department.findMany({
      where: { organizationId: req.organizationId as string },
      orderBy: { name: "asc" }
    });
    res.json(departments);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch departments" });
  }
};

export const createDepartment = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name } = req.body;
  
  if (!name) {
    res.status(400).json({ error: "Department name is required" });
    return;
  }

  try {
    const department = await prisma.department.create({
      data: {
        name,
        organizationId: req.organizationId as string
      }
    });

    res.status(201).json(department);
  } catch (error) {
    res.status(500).json({ error: "Failed to create department" });
  }
};
