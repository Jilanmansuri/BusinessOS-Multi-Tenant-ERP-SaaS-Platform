import { Router } from "express";
import { getProducts, createProduct } from "../controllers/product.controller";
import { authenticate, requireOrganization } from "../middlewares/auth";

const router = Router();

router.use(authenticate, requireOrganization);

router.get("/", getProducts);
router.post("/", createProduct);

export default router;
