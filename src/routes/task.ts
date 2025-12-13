import express from 'express';
import { createTask, deleteTask, getTasks, updateTask, getTaskCounts, getOverdueTasks, getActiveTasks, updateTaskStatus } from '../controller/task';
import { adminOnly } from '../middleware/adminOnly';
import { validateToken } from '../middleware/auth';
import { uploadAttachment } from '../middleware/upload'; // Import the upload from '../middleware/upload';
const router = express.Router();

// Get Task(s) based on ID (Your existing code)
router.post('/get-tasks', (req, res, next) => {
    console.log('TASK ROUTE: GET-TASKS request received');
    next();
}, getTasks);

// =================================================================
// START: New Endpoint to Create a Task
// =================================================================

router.post('/createTask', (req:any, res:any, next) => {
    console.log('TASK ROUTE: CREATE-TASK request received');
    next();
}, validateToken,adminOnly,uploadAttachment.single('filename'),createTask);

// =================================================================
// END: New Endpoint to Create a Task
// =================================================================

router.post('/updateTask', (req :any , res : any, next) => {
    console.log('TASK ROUTE: UPDATE-TASK request received');
    next();
}, validateToken,adminOnly,uploadAttachment.single('filename'),updateTask);

router.post('/deleteTask', (req, res, next) => {
    console.log('TASK ROUTE: DELETE-TASK request received');
    next();
}, validateToken, deleteTask);

// Get task counts for dashboard
router.post('/get-task-counts', (req, res, next) => {
    console.log('TASK ROUTE: GET-TASK-COUNTS request received');
    next();
}, validateToken, getTaskCounts);

// Get overdue tasks for dashboard
router.post('/get-overdue-tasks', (req, res, next) => {
    console.log('TASK ROUTE: GET-OVERDUE-TASKS request received');
    next();
}, validateToken, getOverdueTasks);

// Get active tasks for dashboard
router.post('/get-active-tasks', (req, res, next) => {
    console.log('TASK ROUTE: GET-ACTIVE-TASKS request received');
    next();
}, validateToken, getActiveTasks);

// Update task status for dashboard
router.post('/update-task-status', (req, res, next) => {
    console.log('TASK ROUTE: UPDATE-TASK-STATUS request received');
    next();
}, validateToken, updateTaskStatus);

export default router;