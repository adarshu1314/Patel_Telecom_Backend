"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadSingle = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
// Configure storage for uploaded files
const storage = multer_1.default.memoryStorage(); // Store files in memory as buffers
// Create multer upload instance
exports.upload = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit for files
    },
    fileFilter: (req, file, cb) => {
        // Accept Excel files and images
        if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
            file.mimetype === 'application/vnd.ms-excel' ||
            file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Only Excel files and images are allowed!'), false);
        }
    },
});
// Single file upload middleware
exports.uploadSingle = exports.upload.single('selfiePhoto');
//# sourceMappingURL=upload.js.map