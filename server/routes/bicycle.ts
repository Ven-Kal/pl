import { insertBicycleSchema, bicycles } from "@shared/schema.js";
import { upload } from "server/utils/multer.js";
import { db } from 'server/db.js';
import { Express, Request, Response, NextFunction } from "express";
import { RequestHandler } from "express-serve-static-core";
import { ZodError } from "zod";

export function registerBicycleRoutes(app: Express) {
  app.post("/api/hey", upload.array("images", 5), (async (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    try {
      const sellerId = Number(req.user.id);
      delete req.body.isPremium;
      
      // Fix the files handling
      const files = req.files as Express.Multer.File[];
      const imageUrls = files ? files.map((file) => file.path) : [];
      
      const parsed = insertBicycleSchema.parse({
        ...req.body,
        sellerId,
        images: imageUrls,
      });

      // Cast the price to string if your schema expects it
      const insertData = {
        ...parsed,
        price: String(parsed.price)
      };

      const inserted = await db.insert(bicycles).values(insertData).returning();
      res.status(201).json({ success: true, data: inserted[0] });
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json({ success: false, errors: err.errors });
        return;
      }
      console.error(err);
      res.status(500).json({ success: false, message: "Something went wrong." });
    }
  }) as RequestHandler);

  app.get("/api/hey", (async (req: Request, res: Response, next: NextFunction) => {
    const lat = req.query.lat ? parseFloat(req.query.lat as string) : undefined;
    const lon = req.query.lon ? parseFloat(req.query.lon as string) : undefined;
    const radius = req.query.radius ? parseFloat(req.query.radius as string) : 50000;

    if (lat === undefined || lon === undefined) {
      res.status(400).json({ error: "Latitude and longitude are required." });
      return;
    }

    try {
      const allBicycles = await db.select().from(bicycles);
      const bicyclesWithinRadius = allBicycles.filter((bike) => {
        // Check if latitude and longitude exist on the bike object
        // Assuming these properties should exist but TypeScript doesn't know about them
        const bikeLat = (bike as any).lat;
        const bikeLon = (bike as any).lon;
        
        if (bikeLat == null || bikeLon == null) return false;
        const distance = getDistanceFromLatLonInMeters(lat, lon, bikeLat, bikeLon);
        return distance <= radius;
      });

      res.json(bicyclesWithinRadius);
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Something went wrong." });
    }
  }) as RequestHandler);

  // Utility function for distance
  function getDistanceFromLatLonInMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371e3; // Earth radius in meters
    const toRad = (x: number) => (x * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}