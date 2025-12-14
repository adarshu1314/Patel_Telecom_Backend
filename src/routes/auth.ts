import express, { Request, Response } from 'express';

import { validateToken } from '../middleware/auth';
import { getProfile, loginCustomer,loginAdmin } from '../controller/auth';

const router = express.Router();


// Login route
router.post('/login', loginCustomer);
router.post('/loginAdmin', loginAdmin);

// Get current user profile (protected route example)
router.get('/profile', getProfile);


router.get("/validate-token", validateToken, (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: "Token is valid",
        user: req.user
    })
})

export default router;