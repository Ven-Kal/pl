import { pgTable, text, serial, integer, boolean, timestamp, numeric, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Existing tables
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("firstName").notNull(),
  lastName: text("lastName").notNull(),
  email: text("email").notNull(),
  mobile: text("mobile").notNull(),
  city: text("city").notNull(),
  subCity: text("subCity").notNull(),
  cyclingProficiency: text("cyclingProficiency").notNull(),
  type: text("type").notNull(),
  businessName: text("businessName"),
  businessAddress: text("businessAddress"),
  businessPhone: text("businessPhone"),
  businessHours: text("businessHours"),
  isAdmin: boolean("isAdmin").default(false),
});

export const aadhaarVerifications = pgTable("aadhaar_verifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  aadhaarNumber: text("aadhaar_number").notNull().unique(),
  frontImageUrl: text("front_image_url").notNull(),
  backImageUrl: text("back_image_url").notNull(),
  status: text("status").default("pending").notNull(), // e.g., pending / verified / rejected
  submittedAt: timestamp("submitted_at").defaultNow(),
});


export const bicycles = pgTable("bicycles", {
  id: serial("id").primaryKey(),
  sellerId: integer("seller_id").notNull().references(()=>users.id),
  category: text("category").notNull(),
  brand: text("brand"),
  model: text("model"),
  purchaseYear: integer("purchase_year").notNull(),
  price: numeric("price").notNull(),
  gearTransmission: text("gear_transmission").notNull(),
  frameMaterial: text("frame_material").notNull(),
  suspension: text("suspension").notNull(),
  condition: text("condition").notNull(),
  cycleType: text("cycle_type").notNull(),
  wheelSize: text("wheel_size").notNull(),
  hasReceipt: boolean("has_receipt").default(false),
  additionalDetails: text("additional_details"),
  images: text("images").array().notNull(),
  isPremium: boolean("is_premium").default(false),
  status: text("status").default("active"),
  views: integer("views").default(0),
  inquiries: integer("inquiries").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Add health check table
export const healthCheck = pgTable("health_check", {
  id: serial("id").primaryKey(),
  status: text("status").default("healthy").notNull(),  // Defaulting to "OK"
  // checkedAt: timestamp("checkedAt").defaultNow().notNull(),
});

export const visits = pgTable("visits", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp").defaultNow(),
  path: text("path").notNull(),
  deviceType: text("deviceType").notNull(),
  platform: text("platform").notNull(),
  browser: text("browser").notNull(),
  userId: integer("userId"),
  sessionId: text("sessionId").notNull(),
});

export const faqs = pgTable("faqs", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  category: text("category").notNull(),
  order: integer("order").notNull(),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow()
});

export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(),
  excerpt: text("excerpt").notNull(),
  featuredImage: text("featuredImage").notNull(),
  authorId: integer("authorId").notNull(),
  readTime: integer("readTime").notNull(),
  categoryId: integer("categoryId").notNull(),
  tags: text("tags").array().notNull(),
  isPublished: boolean("isPublished").default(false),
  seoTitle: text("seoTitle").notNull(),
  seoDescription: text("seoDescription").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export const blogCategories = pgTable("blog_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow(),
});

export const blogTags = pgTable("blog_tags", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow(),
});

export const bicycleWishlist = pgTable("bicycle_wishlist", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  bicycleId: integer("bicycle_id").notNull().references(() => bicycles.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertBicycleWishlistSchema = createInsertSchema(bicycleWishlist)
  .omit({ id: true, createdAt: true })
  .extend({
    userId: z.coerce.number(),
    bicycleId: z.coerce.number(),
  });


/// Insert schemas aadhar
export const insertAadhaarVerificationSchema = createInsertSchema(aadhaarVerifications)
  .omit({ id: true, submittedAt: true })
  .extend({
    userId: z.coerce.number(), // force convert string to number
    aadhaarNumber: z
      .string()
      .regex(/^\d{12}$/, "Invalid Aadhaar number"),
    frontImageUrl: z.string().url(),
    backImageUrl: z.string().url(),
    status: z.enum(["pending", "verified", "rejected"]).optional(),
  });

// Insert schemas
export const insertBicycleSchema = createInsertSchema(bicycles)
  .omit({ id: true, createdAt: true, views: true, inquiries: true })
  .extend({
    images: z.array(z.string().url()).min(1),
    price: z.coerce.number().min(0, "Price must be positive"),
    purchaseYear: z.coerce
      .number()
      .min(2000)
      .max(new Date().getFullYear()),
    category: z.enum(["Adult", "Kids"]),
    condition: z.enum(["Fair", "Good", "Like New"]),
    gearTransmission: z.enum(["Non-Geared", "Multi-Speed"]),
    frameMaterial: z.enum(["Steel", "Aluminum", "Carbon Fiber"]),
    suspension: z.enum(["None", "Front", "Full"]),
    cycleType: z.enum(["Mountain", "Road", "Hybrid", "BMX", "Other"]),
    wheelSize: z.enum(["12", "16", "20", "24", "26", "27.5", "29"]),
    hasReceipt: z.coerce.boolean().default(false),
    isPremium: z.coerce.boolean().default(false),
  });

// Form validation schema (with confirmPassword)
export const userFormSchema = createInsertSchema(users)
  .omit({ id: true })
  .extend({ confirmPassword: z.string() })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
  });

// Database insert schema (without confirmPassword)
export const insertUserSchema = createInsertSchema(users)
  .omit({ id: true });

export const insertFaqSchema = createInsertSchema(faqs).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertBlogPostSchema = createInsertSchema(blogPosts)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    tags: z.array(z.string()),
    readTime: z.number().min(1, "Read time must be at least 1 minute"),
  });

export const insertBlogCategorySchema = createInsertSchema(blogCategories)
  .omit({ id: true, createdAt: true });

export const insertBlogTagSchema = createInsertSchema(blogTags).omit({ id: true, createdAt: true });

// Types
export type InsertBicycle = z.infer<typeof insertBicycleSchema>;
export type Bicycle = typeof bicycles.$inferSelect;
export type UserForm = z.infer<typeof userFormSchema>; // Type for form validation with confirmPassword
export type InsertUser = z.infer<typeof insertUserSchema>; // Type for database operations without confirmPassword
export type User = typeof users.$inferSelect;
export type Visit = typeof visits.$inferSelect;
export type FAQ = typeof faqs.$inferSelect;
export type InsertFAQ = z.infer<typeof insertFaqSchema>;
export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type BlogCategory = typeof blogCategories.$inferSelect;
export type InsertBlogCategory = z.infer<typeof insertBlogCategorySchema>;
export type BlogTag = typeof blogTags.$inferSelect;
export type InsertBlogTag = z.infer<typeof insertBlogTagSchema>;

export type AadhaarVerification = typeof aadhaarVerifications.$inferSelect;
export type InsertAadhaarVerification = z.infer<typeof insertAadhaarVerificationSchema>;