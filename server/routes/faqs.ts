import { insertFaqSchema } from "@shared/schema.js";
import { storage } from "server/storage.js";
import { requireAdmin } from "server/auth.js";
import { Express, Request, Response, NextFunction } from "express";

// Create type-safe route handlers
const getFaqs = async (req: Request, res: Response) => {
  const category = req.query.category as string | undefined;
  const faqs = await storage.getFaqs(category);
  res.json(faqs);
};

const createFaq = async (req: Request, res: Response) => {
  try {
    const faqData = insertFaqSchema.parse(req.body);
    const faq = await storage.createFaq(faqData);
    res.json(faq);
  } catch (error) {
    res.status(400).json(error);
  }
};

const updateFaq = async (req: Request, res: Response) => {
  try {
    const faq = await storage.updateFaq(parseInt(req.params.id), req.body);
    res.json(faq);
  } catch (error) {
    res.status(400).json(error);
  }
};

const deleteFaq = async (req: Request, res: Response) => {
  try {
    await storage.deleteFaq(parseInt(req.params.id));
    res.sendStatus(200);
  } catch (error) {
    res.status(400).json(error);
  }
};

export function registerFaqRoutes(app: Express) {
  // Register routes with explicit typing to avoid TypeScript errors
  app.get("/api/faqs", getFaqs);
  app.post("/api/admin/faqs", requireAdmin as any, createFaq);
  app.patch("/api/admin/faqs/:id", requireAdmin as any, updateFaq);
  app.delete("/api/admin/faqs/:id", requireAdmin as any, deleteFaq);
}