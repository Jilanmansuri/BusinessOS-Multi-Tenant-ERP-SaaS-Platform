import { Request, Response } from "express";
import { prisma } from "../prisma";
import { AuthRequest } from "../middlewares/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const getAIInsights = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Collect data to send to Gemini
    const orders = await prisma.order.findMany({ where: { organizationId: req.organizationId }, select: { total: true, createdAt: true } });
    const expenses = await prisma.expense.findMany({ where: { organizationId: req.organizationId }, select: { amount: true, date: true } });
    const products = await prisma.product.findMany({ where: { organizationId: req.organizationId }, select: { name: true, stock: true, reorderLevel: true } });
    
    // In a real app we'd construct a detailed prompt. We'll simulate if no API key is provided.
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      // Mock insights if no API key
      res.json({
        insights: [
          "Revenue grew 18% this month, largely driven by the 'Electronics' category.",
          "Product SKU-992 should be restocked in 5 days to avoid stockouts.",
          "Marketing spend increased 30% without a proportional increase in lead generation."
        ]
      });
      return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const prompt = `You are an AI CFO for a company. Analyze this data: Orders: ${orders.length}, Expenses count: ${expenses.length}, Low stock products: ${products.filter(p => p.stock <= p.reorderLevel).length}. Give 3 short, insightful bullet points.`;
    
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Naive split for bullet points
    const insights = text.split('\n').filter(line => line.trim().length > 0).map(line => line.replace(/^[\*\-\d\.]+\s*/, ''));

    res.json({ insights });
  } catch (error) {
    res.status(500).json({ error: "Failed to generate AI insights" });
  }
};
