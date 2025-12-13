import { Request, Response, NextFunction } from "express";

export const adminOnly = (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user;

        // Check if user exists and has admin or superadmin role
        if (!user) {
            return res.status(401).json({ error: "Authentication required" });
        }

        if (user.role !== "ADMIN" && user.role !== "SUPERADMIN") {
            return res.status(403).json({ error: "Admin access required" });
        }

        next();
    } catch (error) {
        console.error("Admin middleware error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};