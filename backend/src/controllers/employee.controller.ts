import { Request, Response } from "express";
import { prisma } from "../prisma";
import { AuthRequest } from "../middlewares/auth";

export const getEmployees = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const employees = await prisma.employee.findMany({
      where: { organizationId: req.organizationId },
      include: { department: true }
    });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch employees" });
  }
};

export const createEmployee = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, email, phone, designation, salary, joiningDate, departmentId } = req.body;
  
  try {
    const employee = await prisma.employee.create({
      data: {
        name,
        email,
        phone,
        designation,
        salary: Number(salary),
        joiningDate: new Date(joiningDate),
        departmentId,
        organizationId: req.organizationId as string,
      }
    });

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        action: "CREATED",
        entity: "Employee",
        entityId: employee.id,
        userId: req.user?.id as string,
        organizationId: req.organizationId as string
      }
    });

    res.status(201).json(employee);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create employee" });
  }
};
