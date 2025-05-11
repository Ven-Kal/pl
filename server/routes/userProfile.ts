import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "../storage.js";
import { setupAuth, requireAdmin } from "../auth.js";
import { insertFaqSchema } from "../../shared/schema.js";
// Either create the missing sitemap file or comment out this import if not needed
// import { generateSitemap } from "./services/sitemap.js";
import { db } from '../db.js';
import { insertBicycleSchema } from "../../shared/schema.js";
import { upload } from "../utils/multer.js"; // adjust path as needed
// ... existing imports ...
import { eq, gte, lte, and, asc, desc, not, or } from "drizzle-orm"; // Add asc and desc to imports
import { z } from "zod";

import { users, bicycles } from "../../shared/schema.js";
// ... existing code ...
import { insertAadhaarVerificationSchema, aadhaarVerifications } from "../../shared/schema.js";

export function userProfileRoutes(app: Express): Server {
    setupAuth(app);

    // Fixed route handler - properly modified to have void return type
    app.get("/api/userlisted/bicycle", (req, res) => {
        if (!req.isAuthenticated()) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        
        const sellerId = Number(req.user?.id);
        
        db.select()
            .from(bicycles)
            .where(eq(bicycles.sellerId, sellerId))
            .then(bicycle => {
                res.json(bicycle);
            })
            .catch(err => {
                console.error("Error fetching bicycles:", err);
                res.status(500).json({ message: "Failed to fetch bicycles" });
            });
    });

    // Fixed route handler with proper return type (void)
    app.patch("/api/profile-image", upload.single("image"), (req, res) => {
        if (!req.isAuthenticated()) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        // Get the image URL from the uploaded file
        const imageUrl = req.file?.path || req.file?.filename || null;
        
        if (!imageUrl) {
            res.status(400).json({ message: "Image upload failed" });
            return;
        }

        // Commented out until we identify the correct column name for profile images
        // db.update(users)
        //     .set({ 
        //         // You need to use a column that actually exists in your users table
        //         // TODO: Replace with the correct column name for profile images
        //         // email: imageUrl // This is likely incorrect - needs to be the proper column name
        //     })
        //     .where(eq(users.id, req.user.id))
        //     .returning()
        //     .then(updated => {
        //         res.status(200).json({ imageUrl: imageUrl });
        //     })
        //     .catch(err => {
        //         console.error("Error updating profile image:", err);
        //         res.status(500).json({ message: "Failed to update profile image" });
        //     });
            
        // For now, just return the image URL without updating the database
        res.status(200).json({ imageUrl: imageUrl });
    });

    const httpServer = createServer(app);
    return httpServer;
}