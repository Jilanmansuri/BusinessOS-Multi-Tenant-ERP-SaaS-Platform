import { Router } from "express";
import { getAIInsights } from "../controllers/ai.controller";
import { authenticate, requireOrganization } from "../middlewares/auth";

const router = Router();

router.use(authenticate, requireOrganization);

router.get("/insights", getAIInsights);

export default router;
