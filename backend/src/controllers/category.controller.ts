import { Response } from "express";
import { prisma } from "../prisma";
import { AuthRequest } from "../middlewares/auth";

export const getCategories = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const categories = await prisma.category.findMany({
      where: { organizationId: req.organizationId as string },
      orderBy: { name: "asc" }
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
};

export const createCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name } = req.body;

  if (!name) {
    res.status(400).json({ error: "Category name is required" });
    return;
  }

  try {
    const category = await prisma.category.create({
      data: {
        name,
        organizationId: req.organizationId as string
      }
    });

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: "Failed to create category" });
  }
};
