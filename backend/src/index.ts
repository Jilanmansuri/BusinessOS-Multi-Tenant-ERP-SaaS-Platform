import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes";
import orgRoutes from "./routes/organization.routes";
import employeeRoutes from "./routes/employee.routes";
import customerRoutes from "./routes/customer.routes";
import taskRoutes from "./routes/task.routes";
import productRoutes from "./routes/product.routes";
import orderRoutes from "./routes/order.routes";
import expenseRoutes from "./routes/expense.routes";
import aiRoutes from "./routes/ai.routes";
import departmentRoutes from "./routes/department.routes";
import categoryRoutes from "./routes/category.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Basic health check route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "BusinessOS API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/organizations", orgRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/categories", categoryRoutes);

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
