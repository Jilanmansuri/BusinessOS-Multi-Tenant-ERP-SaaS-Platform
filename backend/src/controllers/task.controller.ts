import { Request, Response } from "express";
import { prisma } from "../prisma";
import { AuthRequest } from "../middlewares/auth";

export const getTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tasks = await prisma.task.findMany({
      where: { organizationId: req.organizationId },
      include: { assignedTo: { select: { name: true } } }
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
};

export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
  const { title, description, status, priority, assignedToId, dueDate } = req.body;
  
  try {
    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: status || "TODO",
        priority: priority || "MEDIUM",
        assignedToId,
        dueDate: dueDate ? new Date(dueDate) : null,
        organizationId: req.organizationId as string,
      }
    });

    await prisma.auditLog.create({
      data: {
        action: "CREATED",
        entity: "Task",
        entityId: task.id,
        userId: req.user?.id as string,
        organizationId: req.organizationId as string
      }
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: "Failed to create task" });
  }
};
