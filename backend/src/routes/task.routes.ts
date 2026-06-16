import { Router } from "express";
import { getTasks, createTask } from "../controllers/task.controller";
import { authenticate, requireOrganization } from "../middlewares/auth";

const router = Router();

router.use(authenticate, requireOrganization);

router.get("/", getTasks);
router.post("/", createTask);

export default router;
