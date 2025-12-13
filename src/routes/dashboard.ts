import express from 'express';
import { getDashboardStats, getFilteredTasks, getDashboardFilters } from '../controller/dashboard';
import { validateToken } from '../middleware/auth';

const router = express.Router();

// Get dashboard statistics and analytics
router.post('/stats', (req, res, next) => {
    console.log('DASHBOARD ROUTE: STATS request received');
    next();
}, validateToken, getDashboardStats);

// Get filtered tasks for dashboard
router.post('/filtered-tasks', (req, res, next) => {
    console.log('DASHBOARD ROUTE: FILTERED-TASKS request received');
    next();
}, validateToken, getFilteredTasks);

// Get available filters for dashboard
router.post('/filters', (req, res, next) => {
    console.log('DASHBOARD ROUTE: FILTERS request received');
    next();
}, validateToken, getDashboardFilters);

export default router;