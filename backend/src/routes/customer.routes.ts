import { Router } from "express";
import { getCustomers, createCustomer } from "../controllers/customer.controller";
import { authenticate, requireOrganization } from "../middlewares/auth";

const router = Router();

router.use(authenticate, requireOrganization);

router.get("/", getCustomers);
router.post("/", createCustomer);

export default router;
