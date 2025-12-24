import express from "express";
import { CreateQuotation, GetQuotation, GetQuotationById, GetQuotationAdmin, UpdateQuotationAdmin } from '../controller/quotation';
import { validateToken } from '../middleware/auth';
import { adminOnly } from '../middleware/adminOnly';

const router = express.Router();


// Quotation routes
router.post('/create', validateToken, CreateQuotation);
router.get('/getQuotation', validateToken, GetQuotation);
router.get('/getQuotation/:id', validateToken, GetQuotationById);
router.get('/admin', validateToken, adminOnly, GetQuotationAdmin);
router.put('/updateAdmin/:id', validateToken, adminOnly, UpdateQuotationAdmin);

export default router;
