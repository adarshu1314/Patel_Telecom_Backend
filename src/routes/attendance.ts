import express from 'express';
import { getAttendance, updateAttendance, deleteAttendance, createAttendance, getUserMonthlySummary, punchIn, punchOut, updateAttendanceStatus } from '../controller/attendance';
import {uploadSingle} from '../middleware/upload';
import { adminOnly } from '../middleware/adminOnly';
const router = express.Router();

// Punch in/out endpoints - use multer middleware for file uploads
router.post('/punchIn', uploadSingle, punchIn);
router.post('/punchOut', punchOut);
router.post('/createAttendance', uploadSingle, createAttendance);

// Legacy endpoints
router.post('/getAttendance', getAttendance);
router.post('/UpdateAttendance', updateAttendance);
router.post('/createAttendance', createAttendance);
router.post('/deleteAttendance', deleteAttendance);
router.post('/getUserMonthlySummary', getUserMonthlySummary);

// Admin approval/rejection endpoints
router.post('/updateStatus/:recordId', adminOnly, updateAttendanceStatus);

export default router;