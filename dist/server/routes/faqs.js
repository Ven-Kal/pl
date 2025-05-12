import { insertFaqSchema } from "@shared/schema.js";
import { storage } from "server/storage.js";
import { requireAdmin } from "server/auth.js";
// Create type-safe route handlers
const getFaqs = async (req, res) => {
    const category = req.query.category;
    const faqs = await storage.getFaqs(category);
    res.json(faqs);
};
const createFaq = async (req, res) => {
    try {
        const faqData = insertFaqSchema.parse(req.body);
        const faq = await storage.createFaq(faqData);
        res.json(faq);
    }
    catch (error) {
        res.status(400).json(error);
    }
};
const updateFaq = async (req, res) => {
    try {
        const faq = await storage.updateFaq(parseInt(req.params.id), req.body);
        res.json(faq);
    }
    catch (error) {
        res.status(400).json(error);
    }
};
const deleteFaq = async (req, res) => {
    try {
        await storage.deleteFaq(parseInt(req.params.id));
        res.sendStatus(200);
    }
    catch (error) {
        res.status(400).json(error);
    }
};
export function registerFaqRoutes(app) {
    // Register routes with explicit typing to avoid TypeScript errors
    app.get("/api/faqs", getFaqs);
    app.post("/api/admin/faqs", requireAdmin, createFaq);
    app.patch("/api/admin/faqs/:id", requireAdmin, updateFaq);
    app.delete("/api/admin/faqs/:id", requireAdmin, deleteFaq);
}
