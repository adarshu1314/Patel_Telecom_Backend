"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const task_1 = require("../controller/task");
const adminOnly_1 = require("../middleware/adminOnly");
const auth_1 = require("../middleware/auth");
const ticketUpload_1 = require("../middleware/ticketUpload");
const router = express_1.default.Router();
// Get Task(s) based on ID (Your existing code)
router.post('/get-tasks', (req, res, next) => {
    console.log('TASK ROUTE: GET-TASKS request received');
    next();
}, task_1.getTasks);
// =================================================================
// START: New Endpoint to Create a Task
// =================================================================
router.post('/createTask', (req, res, next) => {
    console.log('TASK ROUTE: CREATE-TASK request received');
    next();
}, adminOnly_1.adminOnly, ticketUpload_1.ticketUpload.array('files', 5), // Allow up to 5 files
ticketUpload_1.handleTicketFileUpload, task_1.createTask);
// =================================================================
// END: New Endpoint to Create a Task
// =================================================================
router.post('/updateTask', (req, res, next) => {
    console.log('TASK ROUTE: UPDATE-TASK request received');
    next();
}, auth_1.validateToken, task_1.updateTask);
router.post('/deleteTask', (req, res, next) => {
    console.log('TASK ROUTE: DELETE-TASK request received');
    next();
}, auth_1.validateToken, task_1.deleteTask);
// Get task counts for dashboard
router.post('/get-task-counts', (req, res, next) => {
    console.log('TASK ROUTE: GET-TASK-COUNTS request received');
    next();
}, auth_1.validateToken, task_1.getTaskCounts);
// Get overdue tasks for dashboard
router.post('/get-overdue-tasks', (req, res, next) => {
    console.log('TASK ROUTE: GET-OVERDUE-TASKS request received');
    next();
}, auth_1.validateToken, task_1.getOverdueTasks);
// Get active tasks for dashboard
router.post('/get-active-tasks', (req, res, next) => {
    console.log('TASK ROUTE: GET-ACTIVE-TASKS request received');
    next();
}, auth_1.validateToken, task_1.getActiveTasks);
// Update task status for dashboard
router.post('/update-task-status', (req, res, next) => {
    console.log('TASK ROUTE: UPDATE-TASK-STATUS request received');
    next();
}, auth_1.validateToken, task_1.updateTaskStatus);
exports.default = router;
//# sourceMappingURL=task.js.map