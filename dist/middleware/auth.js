"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireSuperAdmin = exports.requireAdmin = exports.requireRole = exports.validateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const validateToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Authorization token required'
            });
        }
        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        try {
            const jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
            const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
            req.user = {
                userId: decoded.userId,
                email: decoded.email,
                name: decoded.name,
                role: decoded.role,
                department: decoded.department
            };
            next();
        }
        catch (jwtError) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }
    }
    catch (error) {
        console.error('AUTH MIDDLEWARE: Unexpected error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.validateToken = validateToken;
// Role-based access control middleware
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions'
            });
        }
        next();
    };
};
exports.requireRole = requireRole;
// Admin role middleware
exports.requireAdmin = (0, exports.requireRole)(['ADMIN', 'SUPERADMIN']);
// Superadmin role middleware
exports.requireSuperAdmin = (0, exports.requireRole)(['SUPERADMIN']);
//# sourceMappingURL=auth.js.map