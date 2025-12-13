"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dashboard_1 = require("../controller/dashboard");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Get dashboard statistics and analytics
router.post('/stats', (req, res, next) => {
    console.log('DASHBOARD ROUTE: STATS request received');
    next();
}, auth_1.validateToken, dashboard_1.getDashboardStats);
// Get filtered tasks for dashboard
router.post('/filtered-tasks', (req, res, next) => {
    console.log('DASHBOARD ROUTE: FILTERED-TASKS request received');
    next();
}, auth_1.validateToken, dashboard_1.getFilteredTasks);
// Get available filters for dashboard
router.post('/filters', (req, res, next) => {
    console.log('DASHBOARD ROUTE: FILTERS request received');
    next();
}, auth_1.validateToken, dashboard_1.getDashboardFilters);
exports.default = router;
//# sourceMappingURL=dashboard.js.map