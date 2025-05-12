import express from 'express';
import { registerRoutes } from './routes.js';
import session from 'express-session';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import MemoryStore from 'memorystore';
import path from 'path';
import { fileURLToPath } from 'url';
import { setupVite, serveStatic } from './vite.js';
import http from 'http';
// Drizzle + DB setup
import { db } from './db.js'; // your Drizzle client
import { healthCheck } from '../shared/schema.js'; // your pgTable schema
import { userProfileRoutes } from '../server/routes/userProfile.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.set('trust proxy', 1);
console.log('Initializing Express application...');
// Helmet config
console.log('Configuring security middleware...');
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https:", "http:"],
            styleSrc: ["'self'", "'unsafe-inline'", "https:", "http:"],
            imgSrc: ["'self'", "data:", "blob:", "https:", "http:"],
            connectSrc: ["'self'", "https:", "http:", "ws:", "wss:"],
            fontSrc: ["'self'", "data:", "https:", "http:"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'", "https:", "http:"],
            frameSrc: ["'self'", "https:", "http:"]
        },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
// Rate limiter
console.log('Setting up rate limiting...');
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100000,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));
// CORS config
console.log('Configuring CORS...');
app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
// Session setup
console.log('Setting up session management...');
const MemoryStoreSession = MemoryStore(session);
app.use(session({
    store: new MemoryStoreSession({ checkPeriod: 86400000 }),
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        sameSite: (process.env.NODE_ENV === 'production' ? 'strict' : 'lax'),
        domain: process.env.NODE_ENV === 'production' ? process.env.DOMAIN : undefined,
    }
}));
// Simple request logger
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
    });
    next();
});
// Serve static
app.use(express.static(path.join(__dirname, '../dist/public')));
// Health check using Drizzle
app.get('/health', async (req, res) => {
    try {
        // Perform a simple query, like selecting the first row from any table
        // console.log(db);
        const result = await db.select().from(healthCheck).limit(1);
        res.status(200).json({ status: 'OK', result });
        // const result = await db.select().from('health_check').limit(1); // Replace 'your_table_name' with an actual table from your schema
        console.log('Health check result:', result);
        ;
    }
    catch (error) {
        console.log('Error during health check:', error);
        // ('Error while connecting to database:', error);
    }
});
// Test route
app.get('/test', (_req, res) => {
    res.json({ message: 'Server is running correctly' });
});
// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    if (res.headersSent)
        return next(err);
    const status = err.status || 500;
    const message = process.env.NODE_ENV === 'production'
        ? 'Internal Server Error'
        : err.message || 'Internal Server Error';
    res.status(status).json({
        error: {
            message,
            ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
        },
    });
});
const startServer = async () => {
    try {
        console.log('Starting server initialization...');
        const server = http.createServer(app);
        try {
            console.log('Registering API routes...');
            await registerRoutes(app);
            await userProfileRoutes(app);
            console.log('API routes registered successfully');
            if (process.env.NODE_ENV !== 'production') {
                console.log('Setting up Vite development server...');
                await setupVite(app, server);
                console.log('Vite development server setup complete');
            }
            else {
                console.log('Setting up static file serving...');
                serveStatic(app);
                console.log('Static file serving setup complete');
            }
            const port = 5000;
            server.listen(port, '0.0.0.0', () => {
                console.log(`Server started on port ${port}`);
                console.log(`Running in ${process.env.NODE_ENV || 'development'} mode`);
            });
        }
        catch (setupError) {
            console.error('Failed to setup server components:', setupError);
            throw setupError;
        }
    }
    catch (error) {
        console.error('Fatal server startup error:', error);
        process.exit(1);
    }
};
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});
startServer();
