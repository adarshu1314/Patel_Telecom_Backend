"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = __importDefault(require("./routes/auth"));
const task_1 = __importDefault(require("./routes/task"));
const client_1 = __importDefault(require("./routes/client"));
const user_1 = __importDefault(require("./routes/user"));
const dashboard_1 = __importDefault(require("./routes/dashboard"));
const auth_2 = require("./middleware/auth");
const attendance_1 = __importDefault(require("./routes/attendance"));
const comingSoon_1 = __importDefault(require("./routes/comingSoon"));
const bulk_1 = __importDefault(require("./routes/bulk"));
// Load environment variables
dotenv_1.default?.config();
const app = (0, express_1.default)();
const EXPRESS_PORT = process.env.EXPRESS_PORT ? Number(process.env.EXPRESS_PORT) : 8080;
const EXPRESS_HOST = process.env.EXPRESS_HOST || "localhost";
// Middleware
app.use(express_1.default.json());
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express_1.default.urlencoded({ extended: true }));
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
app.use("/api/auth", auth_1.default);
app.use("/api/attendance", auth_2.validateToken, attendance_1.default);
app.use("/api/user", auth_2.validateToken, user_1.default);
app.use("/api/client", auth_2.validateToken, client_1.default);
app.use("/api/task", auth_2.validateToken, task_1.default);
app.use("/api/dashboard", auth_2.validateToken, dashboard_1.default);
app.use("/api/coming-soon", auth_2.validateToken, comingSoon_1.default);
app.use("/api/bulk", auth_2.validateToken, bulk_1.default);
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
    }
    catch (error) {
        next(error);
    }
});
// Enhanced error handling middleware
app.use((error, req, res, next) => {
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
app.use((req, res) => {
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
    console.log(`📡 Task routes available at: http://${EXPRESS_HOST}:${EXPRESS_PORT}/task/*`);
});
//# sourceMappingURL=index.js.map