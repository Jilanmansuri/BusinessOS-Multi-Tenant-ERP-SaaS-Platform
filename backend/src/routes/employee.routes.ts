import { Router } from "express";
import { getEmployees, createEmployee } from "../controllers/employee.controller";
import { authenticate, requireOrganization, requireRole } from "../middlewares/auth";

const router = Router();

router.use(authenticate, requireOrganization);

router.get("/", getEmployees);
router.post("/", requireRole(["OWNER", "MANAGER"]), createEmployee);

export default router;
