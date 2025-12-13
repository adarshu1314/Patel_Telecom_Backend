"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = exports.loginUser = void 0;
const dbConnection_1 = __importDefault(require("../utils/dbConnection"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }
        // Find user by email
        const user = await dbConnection_1.default.user.findUnique({
            where: { email },
            select: {
                id: true,
                name: true,
                email: true,
                password: true,
                role: true,
                department: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        // Verify password using bcrypt
        let isPasswordValid = false;
        try {
            isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
        }
        catch (bcryptError) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        // Generate JWT token
        const jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
        const token = jsonwebtoken_1.default.sign({
            userId: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            department: user.department
        }, jwtSecret, { expiresIn: '7d' } // Token expires in 7 days for security
        );
        // Return user info and token
        const response = {
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department
            }
        };
        res.json(response);
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(400).json({
            success: false,
            message: 'Invalid username or password'
        });
    }
};
exports.loginUser = loginUser;
const getProfile = async (req, res) => {
    try {
        // This will be protected by middleware in the future
        // For now, it's public
        res.json({
            success: true,
            message: 'Profile endpoint - will be protected by middleware'
        });
    }
    catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.getProfile = getProfile;
//# sourceMappingURL=auth.js.map