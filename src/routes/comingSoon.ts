import express from 'express';
import { getComingSoon, getComingSoonStatus } from '../controller/comingSoon';
import { validateToken } from '../middleware/auth';

const router = express.Router();

// Get coming soon information
router.get('/info', validateToken, (req, res, next) => {
    console.log('COMING SOON ROUTE: INFO request received');
    next();
}, getComingSoon);

// Get coming soon development status
router.get('/status', validateToken, (req, res, next) => {
    console.log('COMING SOON ROUTE: STATUS request received');
    next();
}, getComingSoonStatus);

export default router;