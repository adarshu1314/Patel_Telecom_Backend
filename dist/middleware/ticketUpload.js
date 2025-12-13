"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleTicketFileUpload = exports.ticketUpload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const dbConnection_1 = __importDefault(require("../utils/dbConnection"));
// Configure storage for uploaded files
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path_1.default.join(__dirname, '../../uploads/tickets');
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExt = path_1.default.extname(file.originalname);
        const fileName = path_1.default.basename(file.originalname, fileExt);
        cb(null, `${fileName}-${uniqueSuffix}${fileExt}`);
    }
});
// Create multer upload instance
exports.ticketUpload = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept various file types
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'image/jpeg',
            'image/png',
            'image/gif',
            'text/plain'
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Invalid file type. Only PDF, DOC, DOCX, XLS, XLSX, images, and text files are allowed.'), false);
        }
    },
});
// Middleware to handle file upload and metadata storage
const handleTicketFileUpload = async (req, res, next) => {
    try {
        // Check if there are files uploaded
        if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
            // No files uploaded, continue to next middleware/controller
            return next();
        }
        // Get the ticket ID from the request body (will be available after task creation)
        const ticketId = req.body.ticketId;
        if (!ticketId) {
            return res.status(400).json({ error: 'Ticket ID is required for file upload' });
        }
        // Handle single file or multiple files
        const files = Array.isArray(req.files) ? req.files : [req.files];
        const uploadRecords = [];
        for (const file of files) {
            const fileInfo = file;
            // Create upload record in database
            const uploadRecord = await dbConnection_1.default.upload.create({
                data: {
                    fileName: path_1.default.basename(fileInfo.originalname, path_1.default.extname(fileInfo.originalname)),
                    fileExt: path_1.default.extname(fileInfo.originalname),
                    fileSize: fileInfo.size,
                    filePath: fileInfo.path,
                    createdBy: req.user?.userId || 0,
                    ticketId: parseInt(ticketId),
                }
            });
            uploadRecords.push(uploadRecord);
        }
        // Add upload records to request for further processing
        req.body.uploadRecords = uploadRecords;
        next();
    }
    catch (error) {
        console.error('Error handling ticket file upload:', error);
        return res.status(500).json({ error: 'Internal server error during file upload' });
    }
};
exports.handleTicketFileUpload = handleTicketFileUpload;
//# sourceMappingURL=ticketUpload.js.map