import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import encryptRoutes from "./routes/encrypt";
import { validateToken } from "./middleware/auth";
import productBulkRoutes from "./routes/productbulk";
import cartRoutes from "./routes/cart";
// Load environment variables
dotenv?.config();

const app = express();
const EXPRESS_PORT: number = process.env.EXPRESS_PORT ? Number(process.env.EXPRESS_PORT) : 8080;
const EXPRESS_HOST = process.env.EXPRESS_HOST || "localhost";

// Middleware
app.use(express.json());
app.use(helmet());
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.urlencoded({ extended: true }));

// Enhanced logging middleware for debugging
app.use((req, res, next) => {
  console.log('🔍 SERVER LOG:', {
    method: req.method,
    url: req.url,
    headers: req.headers?.authorization ? { ...req.headers, authorization: '***REDACTED***' } : req.headers,
    body: req.body,
    timestamp: new Date().toISOString()
  });
  next();
});

// Test log to verify console is working
console.log('🚀 Backend initialization started - console logging test');



// Auth routes
app.use("/api/auth", authRoutes);
app.use("/api/encrypt", encryptRoutes);
app.use("/api/productbulk",validateToken, productBulkRoutes);
app.use("/api/cart",validateToken, cartRoutes);


// Basic health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// Add a test route to trigger errors for debugging
app.get("/api/error-test", (req, res, next) => {
  try {
    throw new Error("This is a test error for debugging purposes");
  } catch (error) {
    next(error);
  }
});

// Enhanced error handling middleware
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  console.error('ERROR HANDLING MIDDLEWARE:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Handle 404 routes
app.use((req: Request, res: Response) => {
  console.log('404 HANDLER:', {
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString()
  });
  res.status(404).json({ error: 'Route not found' });
});

app.listen(EXPRESS_PORT, EXPRESS_HOST, () => {
  console.log(`🚀 Server is running on port ${EXPRESS_PORT}`);
  console.log(`📍 Host: ${EXPRESS_HOST}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`💚 Health check available at: http://${EXPRESS_HOST}:${EXPRESS_PORT}/health`);
  console.log(`🔧 Error test available at: http://${EXPRESS_HOST}:${EXPRESS_PORT}/error-test`);
  console.log(`📡 Task routes available at: http://${EXPRESS_HOST}:${EXPRESS_PORT}/auth/*`);
});
