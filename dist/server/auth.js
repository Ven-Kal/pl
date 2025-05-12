// auth.ts
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { eq } from "drizzle-orm";
import { db } from "./db.js";
import { users } from "../shared/schema.js";
import { insertUserSchema } from "../shared/schema.js";
import { generateOtp, otpStore, saveOtpToStore, verifyOtpFromStore } from "./utils/otp.js";
import { sendEmailOtp } from "./utils/sendEmailOtp.js";
const scryptAsync = promisify(scrypt);
export async function hashPassword(password) {
    const salt = randomBytes(16).toString("hex");
    const derivedKey = (await scryptAsync(password, salt, 64));
    return `${derivedKey.toString("hex")}.${salt}`;
}
export async function comparePasswords(input, stored) {
    const [hash, salt] = stored.split(".");
    const hashedBuf = Buffer.from(hash, "hex");
    const inputBuf = (await scryptAsync(input, salt, 64));
    return timingSafeEqual(hashedBuf, inputBuf);
}
export function requireAdmin(req, res, next) {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
    }
    if (!req.user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
    }
    next();
}
export function setupAuth(app) {
    const sessionSettings = {
        secret: process.env.SESSION_SECRET || "default_secret",
        resave: false,
        saveUninitialized: false,
    };
    if (app.get("env") === "production") {
        app.set("trust proxy", 1);
        sessionSettings.cookie = { secure: true };
    }
    app.use(session(sessionSettings));
    app.use(passport.initialize());
    app.use(passport.session());
    passport.use(new LocalStrategy(async (username, password, done) => {
        try {
            const user = await db.query.users.findFirst({
                where: eq(users.username, username),
            });
            if (!user || !(await comparePasswords(password, user.password))) {
                return done(null, false);
            }
            return done(null, user);
        }
        catch (err) {
            return done(err);
        }
    }));
    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await db.query.users.findFirst({
                where: eq(users.id, id),
            });
            done(null, user || false);
        }
        catch (err) {
            done(err);
        }
    });
    // Auth routes - fixed return types to not return Response objects
    const registerHandler = async (req, res, next) => {
        try {
            req.body.username = req.body.email;
            const { isVerifyingOtp, otp, ...rest } = req.body;
            const validated = insertUserSchema.parse(rest);
            if (!isVerifyingOtp) {
                const existing = await db.query.users.findFirst({
                    where: eq(users.username, validated.username),
                });
                if (existing) {
                    console.log("Email already registered");
                    res.status(400).json({ message: "Email already registered" });
                    return;
                }
                if (otpStore.get(validated.email)) {
                    res.status(400).json({ message: "OTP already sent" });
                    return;
                }
                const generatedOtp = generateOtp(); // Only call once
                await saveOtpToStore(validated.email, generatedOtp); // Save to store
                console.log(`OTP (for console debug): ${generatedOtp}`);
                await sendEmailOtp(validated.email, generatedOtp); // Same OTP
                res.status(200).json({ message: "OTP sent to your email" });
                return;
            }
            else {
                // Phase 2: Verify OTP and create user
                const isValidOtp = await verifyOtpFromStore(validated.email, otp);
                if (!isValidOtp) {
                    res.status(400).json({ message: "Invalid or expired OTP" });
                    return;
                }
                // Remove destructuring of non-existent properties
                const dataWithoutConfirmPassword = { ...validated };
                // TypeScript doesn't know these properties don't exist in validated,
                // but we'll handle it safely by using a temporary variable
                if ('confirmPassword' in dataWithoutConfirmPassword) {
                    delete dataWithoutConfirmPassword.confirmPassword;
                }
                const newUser = {
                    ...dataWithoutConfirmPassword,
                    password: await hashPassword(validated.password),
                };
                const inserted = await db.insert(users).values(newUser).returning();
                const user = inserted[0];
                req.login(user, (err) => {
                    if (err)
                        return next(err);
                    res.status(201).json(user);
                });
            }
        }
        catch (err) {
            next(err);
        }
    };
    const userHandler = (req, res) => {
        if (!req.isAuthenticated()) {
            res.sendStatus(401);
            return;
        }
        res.json(req.user);
    };
    const profilePasswordHandler = async (req, res) => {
        if (!req.isAuthenticated()) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const userId = Number(req.user?.id);
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            res.status(400).json({ message: "Both current and new passwords are required" });
            return;
        }
        try {
            const user = await db.query.users.findFirst({
                where: eq(users.id, userId),
            });
            if (!user || !(await comparePasswords(currentPassword, user.password))) {
                res.status(400).json({ message: "Current password is incorrect" });
                return;
            }
            const hashed = await hashPassword(newPassword);
            const updated = await db
                .update(users)
                .set({ password: hashed })
                .where(eq(users.id, userId))
                .returning();
            res.status(200).json({ message: "Password updated successfully" });
        }
        catch (err) {
            console.error("Password update error:", err);
            res.status(500).json({ message: "Failed to update password" });
        }
    };
    app.post("/api/register", registerHandler);
    app.post("/api/login", passport.authenticate("local"), (req, res) => {
        res.status(200).json(req.user);
    });
    app.post("/api/logout", (req, res, next) => {
        req.logout((err) => {
            if (err)
                return next(err);
            res.status(200).json({ message: "Logout successful" });
        });
    });
    app.get("/api/user", userHandler);
    app.patch("/api/profile-password", profilePasswordHandler);
}
