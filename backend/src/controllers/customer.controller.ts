import { Request, Response } from "express";
import { prisma } from "../prisma";
import { AuthRequest } from "../middlewares/auth";

export const getCustomers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customers = await prisma.customer.findMany({
      where: { organizationId: req.organizationId }
    });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch customers" });
  }
};

export const createCustomer = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, email, phone } = req.body;
  
  try {
    const customer = await prisma.customer.create({
      data: {
        name,
        email,
        phone,
        organizationId: req.organizationId as string,
      }
    });

    await prisma.auditLog.create({
      data: {
        action: "CREATED",
        entity: "Customer",
        entityId: customer.id,
        userId: req.user?.id as string,
        organizationId: req.organizationId as string
      }
    });

    res.status(201).json(customer);
  } catch (error) {
    res.status(500).json({ error: "Failed to create customer" });
  }
};
