"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const attendance_1 = require("../controller/attendance");
const upload_1 = require("../middleware/upload");
const adminOnly_1 = require("../middleware/adminOnly");
const router = express_1.default.Router();
// Punch in/out endpoints - use multer middleware for file uploads
router.post('/punchIn', upload_1.uploadSingle, attendance_1.punchIn);
router.post('/punchOut', attendance_1.punchOut);
router.post('/createAttendance', upload_1.uploadSingle, attendance_1.createAttendance);
// Legacy endpoints
router.post('/getAttendance', attendance_1.getAttendance);
router.post('/UpdateAttendance', attendance_1.updateAttendance);
router.post('/createAttendance', attendance_1.createAttendance);
router.post('/deleteAttendance', attendance_1.deleteAttendance);
router.post('/getUserMonthlySummary', attendance_1.getUserMonthlySummary);
// Admin approval/rejection endpoints
router.post('/updateStatus/:recordId', adminOnly_1.adminOnly, attendance_1.updateAttendanceStatus);
exports.default = router;
//# sourceMappingURL=attendance.js.map