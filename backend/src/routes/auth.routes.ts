import { Router } from "express";
import { registerUser, loginUser, getMe } from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth";
import { body } from "express-validator";

const router = Router();

router.post(
  "/register",
  [
    body("name", "Name is required").notEmpty(),
    body("email", "Please include a valid email").isEmail(),
    body("password", "Password must be 6 or more characters").isLength({ min: 6 }),
  ],
  registerUser
);

router.post("/login", loginUser);

router.get("/me", authenticate, getMe);

export default router;
