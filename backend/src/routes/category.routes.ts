import { Router } from "express";
import { getCategories, createCategory } from "../controllers/category.controller";
import { authenticate, requireOrganization, requireRole } from "../middlewares/auth";

const router = Router();

router.use(authenticate, requireOrganization);

router.get("/", getCategories);
router.post("/", requireRole(["OWNER", "MANAGER"]), createCategory);

export default router;
