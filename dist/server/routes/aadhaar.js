import { insertAadhaarVerificationSchema, aadhaarVerifications } from "@shared/schema.js";
import { db } from 'server/db.js';
import { upload } from "server/utils/multer.js";
import { z } from "zod";
import { eq, or } from "drizzle-orm"; // Added the missing eq and or imports
export function registerAadhaarRoutes(app) {
    app.post("/api/verify-aadhaar", upload.fields([{ name: "aadhaarFront", maxCount: 1 }, { name: "aadhaarBack", maxCount: 1 }]), async (req, res) => {
        if (!req.isAuthenticated()) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        try {
            const userId = Number(req.user?.id);
            const { aadhaarNumber } = req.body;
            if (!aadhaarNumber) {
                res.status(400).json({ message: "Aadhaar number is required" });
                return;
            }
            const frontImageUrl = req.files?.aadhaarFront?.[0]?.path;
            const backImageUrl = req.files?.aadhaarBack?.[0]?.path;
            if (!frontImageUrl || !backImageUrl) {
                res.status(400).json({ message: "Both images are required" });
                return;
            }
            const parsed = insertAadhaarVerificationSchema.parse({
                userId,
                aadhaarNumber,
                frontImageUrl,
                backImageUrl,
            });
            // Check for existing Aadhaar
            const existingAadhaar = await db
                .select()
                .from(aadhaarVerifications)
                .where(or(eq(aadhaarVerifications.userId, userId), eq(aadhaarVerifications.aadhaarNumber, aadhaarNumber)))
                .limit(1);
            if (existingAadhaar.length > 0) {
                res.status(400).json({ message: "Aadhaar already submitted for this user" });
                return;
            }
            const inserted = await db.insert(aadhaarVerifications).values(parsed).returning();
            res.status(201).json({ success: true, data: inserted[0] });
        }
        catch (err) {
            if (err instanceof z.ZodError) {
                res.status(400).json({ success: false, errors: err.errors });
                return;
            }
            console.error(err);
            res.status(500).json({ message: "Something went wrong" });
        }
    });
    app.get("/api/aadhaar-verification-status", async (req, res) => {
        if (!req.isAuthenticated()) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        try {
            const userId = Number(req.user?.id);
            const result = await db
                .select()
                .from(aadhaarVerifications)
                .where(eq(aadhaarVerifications.userId, userId))
                .limit(1);
            if (result.length === 0) {
                res.status(404).json({ message: "Aadhaar verification record not found" });
                return;
            }
            res.status(200).json({
                status: result[0].status,
                message: "Aadhaar verification status fetched successfully"
            });
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ message: "Internal server error" });
        }
    });
}
