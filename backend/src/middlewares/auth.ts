import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
  organizationId?: string; // Set when user selects/is part of an active org context
  role?: string;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "Access denied. No token provided." });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string; email: string };
    
    // Verify user exists
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) {
      res.status(401).json({ error: "Invalid token. User not found." });
      return;
    }

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token." });
    return;
  }
};

// Middleware to ensure user is part of the requested organization
export const requireOrganization = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const organizationId = req.headers["x-organization-id"] as string;

  if (!organizationId) {
    res.status(400).json({ error: "Organization ID is required in headers (x-organization-id)." });
    return;
  }

  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const member = await prisma.member.findFirst({
      where: {
        userId: req.user.id,
        organizationId: organizationId,
      },
    });

    if (!member) {
      res.status(403).json({ error: "Access denied. You are not a member of this organization." });
      return;
    }

    req.organizationId = organizationId;
    req.role = member.role;
    next();
  } catch (error) {
    res.status(500).json({ error: "Server error verifying organization access." });
    return;
  }
};

// Middleware for RBAC
export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.role || !roles.includes(req.role)) {
      res.status(403).json({ error: "Access denied. Insufficient permissions." });
      return;
    }
    next();
  };
};
