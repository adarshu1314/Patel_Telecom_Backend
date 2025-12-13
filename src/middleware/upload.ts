import multer from 'multer';
import path from 'path';

// Configure storage for uploaded files
const storage = multer.memoryStorage(); // Store files in memory as buffers

// Create multer upload instance
export const upload = multer({
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
        } else {
            cb(new Error('Only Excel files and images are allowed!') as any, false);
        }
    },
});
export const uploadAttachment =multer({ dest: 'uploads/' })
// Single file upload middleware
export const uploadSingle = upload.single('selfiePhoto');