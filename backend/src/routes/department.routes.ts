import { Router } from "express";
import { getDepartments, createDepartment } from "../controllers/department.controller";
import { authenticate, requireOrganization, requireRole } from "../middlewares/auth";

const router = Router();

router.use(authenticate, requireOrganization);

router.get("/", getDepartments);
router.post("/", requireRole(["OWNER", "MANAGER"]), createDepartment);

export default router;
