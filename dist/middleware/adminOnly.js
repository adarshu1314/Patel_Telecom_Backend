"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminOnly = void 0;
const adminOnly = (req, res, next) => {
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
    }
    catch (error) {
        console.error("Admin middleware error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};
exports.adminOnly = adminOnly;
//# sourceMappingURL=adminOnly.js.map