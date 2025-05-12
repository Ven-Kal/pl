import { createServer } from "http";
import { storage } from "../server/storage.js";
import { setupAuth, requireAdmin } from "../server/auth.js";
import { insertFaqSchema } from "../shared/schema.js";
import { generateSitemap } from "../server/services/sitemap.js";
import { db } from '../server/db.js';
import { insertBicycleSchema, bicycles } from "../shared/schema.js";
import { upload } from "./utils/multer.js"; // adjust path as needed
// ... existing imports ...
import { eq, and, desc, or, sql } from "drizzle-orm";
import { z } from "zod";
// ... existing code ...
import { insertAadhaarVerificationSchema, aadhaarVerifications } from "../shared/schema.js";
export function registerRoutes(app) {
    setupAuth(app);
    // Analytics Routes
    app.get("/api/admin/analytics/visits", requireAdmin, (req, res, next) => {
        try {
            const startDate = req.query.startDate ? new Date(req.query.startDate) : undefined;
            const endDate = req.query.endDate ? new Date(req.query.endDate) : undefined;
            const groupByParam = req.query.groupBy;
            // Convert "device" to "deviceType" when needed
            let groupBy = undefined;
            if (groupByParam === "device") {
                groupBy = "deviceType";
            }
            else if (groupByParam) {
                groupBy = groupByParam;
            }
            storage.getVisitAnalytics({ startDate, endDate, groupBy })
                .then(analytics => {
                res.json(analytics);
            })
                .catch(error => {
                next(error);
            });
        }
        catch (error) {
            next(error);
        }
    });
    // Sitemap Route
    app.get("/sitemap.xml", (req, res) => {
        try {
            const baseUrl = process.env.NODE_ENV === 'production'
                ? `https://${process.env.DOMAIN}`
                : `http://${req.headers.host}`;
            generateSitemap(baseUrl)
                .then(sitemap => {
                res.header('Content-Type', 'application/xml');
                res.send(sitemap);
            })
                .catch(error => {
                console.error('Error generating sitemap:', error);
                res.status(500).send('Error generating sitemap');
            });
        }
        catch (error) {
            console.error('Error generating sitemap:', error);
            res.status(500).send('Error generating sitemap');
        }
    });
    // FAQ Routes
    app.get("/api/faqs", (req, res) => {
        const category = req.query.category;
        storage.getFaqs(category)
            .then(faqs => {
            res.json(faqs);
        })
            .catch(error => {
            res.status(500).json({ error: "Failed to fetch FAQs" });
        });
    });
    // FAQ Create
    app.post("/api/admin/faqs", requireAdmin, (req, res) => {
        try {
            const faqData = insertFaqSchema.parse(req.body);
            storage.createFaq(faqData)
                .then(faq => {
                res.json(faq);
            })
                .catch(error => {
                res.status(400).json(error);
            });
        }
        catch (error) {
            res.status(400).json(error);
        }
    });
    // FAQ Update
    app.patch("/api/admin/faqs/:id", requireAdmin, (req, res) => {
        try {
            storage.updateFaq(parseInt(req.params.id), req.body)
                .then(faq => {
                res.json(faq);
            })
                .catch(error => {
                res.status(400).json(error);
            });
        }
        catch (error) {
            res.status(400).json(error);
        }
    });
    // FAQ Delete
    app.delete("/api/admin/faqs/:id", requireAdmin, (req, res) => {
        try {
            storage.deleteFaq(parseInt(req.params.id))
                .then(() => {
                res.sendStatus(200);
            })
                .catch(error => {
                res.status(400).json(error);
            });
        }
        catch (error) {
            res.status(400).json(error);
        }
    });
    // Verify Aadhaar
    app.post("/api/verify-aadhaar", upload.fields([
        { name: "aadhaarFront", maxCount: 1 },
        { name: "aadhaarBack", maxCount: 1 },
    ]), (req, res) => {
        if (!req.isAuthenticated()) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        try {
            console.log("Processing Aadhaar verification");
            const userId = Number(req.user?.id); // ensure it's a number
            const { aadhaarNumber } = req.body;
            if (!aadhaarNumber) {
                res.status(400).json({ message: "Aadhaar number is required" });
                return;
            }
            const files = req.files;
            const frontImageUrl = files?.aadhaarFront?.[0]?.path;
            const backImageUrl = files?.aadhaarBack?.[0]?.path;
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
            // Check if the combination of userId and aadhaarNumber already exists
            db.select()
                .from(aadhaarVerifications)
                .where(or(eq(aadhaarVerifications.userId, userId), eq(aadhaarVerifications.aadhaarNumber, aadhaarNumber)))
                .limit(1)
                .then(existingAadhaar => {
                if (existingAadhaar.length > 0) {
                    res.status(400).json({ message: "Aadhaar already submitted for this user" });
                    return;
                }
                // Insert the new record into the database
                db.insert(aadhaarVerifications).values(parsed).returning()
                    .then(inserted => {
                    res.status(201).json({ success: true, data: inserted[0] });
                })
                    .catch((insertError) => {
                    if (insertError.code === '23505') {
                        // This is a unique constraint violation error for aadhaar_number
                        res.status(400).json({ message: "Aadhaar number already exists in the system" });
                        return;
                    }
                    console.error(insertError);
                    res.status(500).json({ message: "Something went wrong" });
                });
            })
                .catch(err => {
                console.error(err);
                res.status(500).json({ message: "Something went wrong" });
            });
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
    // Aadhaar verification status
    app.get("/api/aadhaar-verification-status", (req, res) => {
        if (!req.isAuthenticated()) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        try {
            const userId = Number(req.user?.id);
            if (!userId) {
                res.status(400).json({ message: "User not found" });
                return;
            }
            console.log("Fetching Aadhaar verification status for user:", userId);
            db.select()
                .from(aadhaarVerifications)
                .where(eq(aadhaarVerifications.userId, userId))
                .limit(1)
                .then(result => {
                console.log("Query result:", result);
                if (result.length === 0) {
                    res.status(404).json({ message: "Aadhaar verification record not found" });
                    return;
                }
                res.status(200).json({
                    status: result[0].status,
                    message: "Aadhaar verification status fetched successfully",
                });
            })
                .catch(err => {
                console.error(err);
                res.status(500).json({ message: "Internal server error" });
            });
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ message: "Internal server error" });
        }
    });
    // Upload bicycle
    app.post("/api/hey", upload.array("images", 5), (req, res) => {
        if (!req.isAuthenticated()) {
            res.status(401).json({ success: false, message: "Unauthorized" });
            return;
        }
        try {
            const sellerId = Number(req.user.id);
            delete req.body.isPremium;
            // Extract secure URLs from Cloudinary-uploaded files
            const files = req.files;
            const imageUrls = files?.map((file) => file.path) ?? [];
            const parsed = insertBicycleSchema.parse({
                ...req.body,
                sellerId,
                images: imageUrls, // inject uploaded image URLs
            });
            // Convert price to string if it's not already a string (for DB compatibility)
            const dbValues = {
                ...parsed,
                price: parsed.price.toString()
            };
            db.insert(bicycles).values(dbValues).returning()
                .then(inserted => {
                res.status(201).json({ success: true, data: inserted[0] });
            })
                .catch(err => {
                console.error(err);
                res.status(500).json({ success: false, message: "Something went wrong." });
            });
        }
        catch (err) {
            if (err.name === "ZodError") {
                res.status(400).json({ success: false, errors: err.errors });
                return;
            }
            console.error(err);
            res.status(500).json({ success: false, message: "Something went wrong." });
        }
    });
    // Get all bicycles
    app.get("/api/hey", (req, res) => {
        db.select()
            .from(bicycles)
            .then(allBicycles => {
            res.json(allBicycles);
        })
            .catch(err => {
            console.error(err);
            res.status(500).json({ message: "Failed to fetch bicycles" });
        });
    });
    // Bicycle details using Id
    app.get("/api/bicycle/details/:id", (req, res) => {
        const bicycleId = req.params.id;
        try {
            db.select()
                .from(bicycles)
                .where(eq(bicycles.id, parseInt(bicycleId)))
                .then(rows => {
                const result = rows[0]; // equivalent to `.first()`
                if (!result) {
                    res.status(404).json({ success: false, message: "Bicycle not found" });
                    return;
                }
                res.status(200).json({ success: true, data: result });
            })
                .catch(err => {
                console.error("Error fetching bicycle details:", err);
                res.status(500).json({ success: false, message: "Something went wrong." });
            });
        }
        catch (err) {
            console.error("Error fetching bicycle details:", err);
            res.status(500).json({ success: false, message: "Something went wrong." });
        }
    });
    // Bicycles with filtering and sorting
    app.get("/api/bicycles", (req, res) => {
        try {
            const { isPremium, brand, yearOfPurchase, condition, gearTransmission, frameMaterial, suspension, wheelSize, minPrice, maxPrice, sortBy } = req.query;
            const conditions = [];
            if (isPremium === "true") {
                conditions.push(eq(bicycles.isPremium, true));
            }
            if (brand) {
                conditions.push(eq(bicycles.brand, String(brand)));
            }
            if (yearOfPurchase) {
                conditions.push(eq(bicycles.purchaseYear, parseInt(yearOfPurchase)));
            }
            if (condition) {
                conditions.push(eq(bicycles.condition, String(condition)));
            }
            if (gearTransmission) {
                conditions.push(eq(bicycles.gearTransmission, String(gearTransmission)));
            }
            if (frameMaterial) {
                conditions.push(eq(bicycles.frameMaterial, String(frameMaterial)));
            }
            if (suspension) {
                conditions.push(eq(bicycles.suspension, String(suspension)));
            }
            if (wheelSize) {
                conditions.push(eq(bicycles.wheelSize, String(wheelSize)));
            }
            if (minPrice) {
                // Convert string price column to numeric for comparison
                conditions.push(sql `CAST(${bicycles.price} AS numeric) >= ${parseInt(minPrice)}`);
            }
            if (maxPrice) {
                // Convert string price column to numeric for comparison
                conditions.push(sql `CAST(${bicycles.price} AS numeric) <= ${parseInt(maxPrice)}`);
            }
            // Start with basic query
            let baseQuery = db.select().from(bicycles);
            // Apply conditions and create the query
            const query = conditions.length > 0
                ? db.select().from(bicycles).where(and(...conditions))
                : baseQuery;
            // Execute the query with correct typing
            const execQuery = () => {
                if (sortBy === "price_asc") {
                    return query.orderBy(sql `CAST(${bicycles.price} AS numeric) ASC`);
                }
                else if (sortBy === "price_desc") {
                    return query.orderBy(sql `CAST(${bicycles.price} AS numeric) DESC`);
                }
                else if (sortBy === "newest") {
                    return query.orderBy(desc(bicycles.createdAt));
                }
                return query;
            };
            // Execute the final query
            execQuery()
                .then(bicycleList => {
                res.status(200).json(bicycleList);
            })
                .catch(error => {
                console.error("Error fetching bicycles:", error);
                res.status(500).json({ message: "Something went wrong" });
            });
        }
        catch (error) {
            console.error("Error fetching bicycles:", error);
            res.status(500).json({ message: "Something went wrong" });
        }
    });
    const httpServer = createServer(app);
    return httpServer;
}
