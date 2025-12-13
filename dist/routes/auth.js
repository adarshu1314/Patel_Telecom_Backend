"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const auth_2 = require("../controller/auth");
const router = express_1.default.Router();
// Login route
router.post('/login', auth_2.loginUser);
// Get current user profile (protected route example)
router.get('/profile', auth_2.getProfile);
router.get("/validate-token", auth_1.validateToken, (req, res) => {
    res.status(200).json({
        success: true,
        message: "Token is valid",
        user: req.user
    });
});
exports.default = router;
//# sourceMappingURL=auth.js.map