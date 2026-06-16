import { Request, Response } from "express";
import { prisma } from "../prisma";
import { AuthRequest } from "../middlewares/auth";

export const getExpenses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const expenses = await prisma.expense.findMany({
      where: { organizationId: req.organizationId },
      orderBy: { date: "desc" }
    });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch expenses" });
  }
};

export const createExpense = async (req: AuthRequest, res: Response): Promise<void> => {
  const { category, amount, description, attachmentUrl } = req.body;
  
  try {
    // Generate expense number (e.g., EXP-001)
    const count = await prisma.expense.count({ where: { organizationId: req.organizationId } });
    const expenseNumber = `EXP-${String(count + 1).padStart(3, '0')}`;

    const expense = await prisma.expense.create({
      data: {
        expenseNumber,
        category,
        amount: Number(amount),
        description,
        attachmentUrl,
        status: "PENDING",
        organizationId: req.organizationId as string,
      }
    });

    await prisma.auditLog.create({
      data: {
        action: "CREATED",
        entity: "Expense",
        entityId: expense.id,
        userId: req.user?.id as string,
        organizationId: req.organizationId as string
      }
    });

    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ error: "Failed to create expense" });
  }
};

export const approveExpense = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status } = req.body; // APPROVED or REJECTED

  try {
    const expense = await prisma.expense.update({
      where: { id: id as string, organizationId: req.organizationId as string },
      data: { 
        status,
        approvedById: req.user?.id 
      }
    });

    res.json(expense);
  } catch (error) {
    res.status(500).json({ error: "Failed to update expense status" });
  }
};
