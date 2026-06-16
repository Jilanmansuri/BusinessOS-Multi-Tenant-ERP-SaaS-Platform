import { Request, Response } from "express";
import { prisma } from "../prisma";
import { AuthRequest } from "../middlewares/auth";

export const getProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const products = await prisma.product.findMany({
      where: { organizationId: req.organizationId },
      include: { category: true }
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, sku, stock, costPrice, sellingPrice, reorderLevel, categoryId } = req.body;
  
  try {
    const profitMargin = Number(sellingPrice) > 0 ? ((Number(sellingPrice) - Number(costPrice)) / Number(sellingPrice)) * 100 : 0;

    const product = await prisma.product.create({
      data: {
        name,
        sku,
        stock: Number(stock),
        costPrice: Number(costPrice),
        sellingPrice: Number(sellingPrice),
        profitMargin,
        reorderLevel: Number(reorderLevel) || 5,
        categoryId,
        organizationId: req.organizationId as string,
      }
    });

    await prisma.auditLog.create({
      data: {
        action: "CREATED",
        entity: "Product",
        entityId: product.id,
        userId: req.user?.id as string,
        organizationId: req.organizationId as string
      }
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: "Failed to create product" });
  }
};
