import express from 'express';
import { downloadUserTemplate, downloadClientTemplate, bulkUploadUsers, bulkUploadClients, temporaryFileUpload, processTemporaryFile, deleteTemporaryFile } from '../controller/bulk';
import { upload } from '../middleware/upload';

const router = express.Router();

// Download templates
router.get('/download-user-template', downloadUserTemplate);
router.get('/download-client-template', downloadClientTemplate);

// Legacy bulk upload endpoints (for backward compatibility)
router.post('/upload-users', upload.single('file'), bulkUploadUsers);
router.post('/upload-clients', upload.single('file'), bulkUploadClients);

// New 2-step bulk upload endpoints
router.post('/temporary-upload', upload.single('file'), temporaryFileUpload);
router.post('/process/:fileId', processTemporaryFile);
router.delete('/temporary-file/:fileId', deleteTemporaryFile);

export default router;