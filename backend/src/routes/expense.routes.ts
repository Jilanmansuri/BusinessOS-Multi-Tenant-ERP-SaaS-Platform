import { Router } from "express";
import { getExpenses, createExpense, approveExpense } from "../controllers/expense.controller";
import { authenticate, requireOrganization, requireRole } from "../middlewares/auth";

const router = Router();

router.use(authenticate, requireOrganization);

router.get("/", getExpenses);
router.post("/", createExpense);
router.patch("/:id/approve", requireRole(["OWNER", "MANAGER"]), approveExpense);

export default router;
