import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';


export const validateToken = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        console.log("Auth Header:", authHeader);
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Authorization token required'
            });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        try {
            const jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
            const decoded = jwt.verify(token, jwtSecret) as any;

            req.user = {
                userId: decoded.userId,
                email: decoded.email,
                name: decoded.name,
                role: decoded.role
            };

            next();
        } catch (jwtError) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }
    } catch (error) {
        console.error('AUTH MIDDLEWARE: Unexpected error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Role-based access control middleware
export const requireRole = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
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

// Admin role middleware
export const requireAdmin = requireRole(['ADMIN', 'SUPERADMIN']);

// Superadmin role middleware
export const requireSuperAdmin = requireRole(['SUPERADMIN']);