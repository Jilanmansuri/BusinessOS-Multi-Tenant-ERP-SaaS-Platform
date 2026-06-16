import { Router } from "express";
import { createOrganization, getOrganizations, getOrganizationMembers } from "../controllers/organization.controller";
import { authenticate, requireOrganization } from "../middlewares/auth";

const router = Router();

router.post("/", authenticate, createOrganization);
router.get("/", authenticate, getOrganizations);
router.get("/members", authenticate, requireOrganization, getOrganizationMembers);

export default router;
