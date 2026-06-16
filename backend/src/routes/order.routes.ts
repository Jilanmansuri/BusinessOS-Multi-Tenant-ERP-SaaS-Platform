import { Router } from "express";
import { getOrders, createOrder } from "../controllers/order.controller";
import { authenticate, requireOrganization } from "../middlewares/auth";

const router = Router();

router.use(authenticate, requireOrganization);

router.get("/", getOrders);
router.post("/", createOrder);

export default router;
