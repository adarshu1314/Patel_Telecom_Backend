"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bulk_1 = require("../controller/bulk");
const upload_1 = require("../middleware/upload");
const router = express_1.default.Router();
// Download templates
router.get('/download-user-template', bulk_1.downloadUserTemplate);
router.get('/download-client-template', bulk_1.downloadClientTemplate);
// Legacy bulk upload endpoints (for backward compatibility)
router.post('/upload-users', upload_1.upload.single('file'), bulk_1.bulkUploadUsers);
router.post('/upload-clients', upload_1.upload.single('file'), bulk_1.bulkUploadClients);
// New 2-step bulk upload endpoints
router.post('/temporary-upload', upload_1.upload.single('file'), bulk_1.temporaryFileUpload);
router.post('/process/:fileId', bulk_1.processTemporaryFile);
router.delete('/temporary-file/:fileId', bulk_1.deleteTemporaryFile);
exports.default = router;
//# sourceMappingURL=bulk.js.map