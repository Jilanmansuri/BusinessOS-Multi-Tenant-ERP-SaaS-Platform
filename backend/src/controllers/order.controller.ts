import { Request, Response } from "express";
import { prisma } from "../prisma";
import { AuthRequest } from "../middlewares/auth";

export const getOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orders = await prisma.order.findMany({
      where: { organizationId: req.organizationId },
      include: { customer: true, items: { include: { product: true } } }
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  const { customerId, items } = req.body; 
  // items array format: [{ productId, quantity, price }]
  
  try {
    let total = 0;
    const orderItemsData = items.map((item: any) => {
      total += item.price * item.quantity;
      return {
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        organizationId: req.organizationId as string,
      };
    });

    const order = await prisma.order.create({
      data: {
        status: "PENDING",
        total,
        customerId,
        organizationId: req.organizationId as string,
        items: {
          create: orderItemsData
        }
      },
      include: { items: true }
    });

    // Deduct inventory
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: Number(item.quantity) } }
      });
    }

    await prisma.auditLog.create({
      data: {
        action: "CREATED",
        entity: "Order",
        entityId: order.id,
        userId: req.user?.id as string,
        organizationId: req.organizationId as string
      }
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: "Failed to create order" });
  }
};
