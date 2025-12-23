
import express from "express";
import { CreateQuotation, GetQuotationAdmin, GetQuotation } from "../controller/quotation";
const router = express.Router();

router.post("/create", CreateQuotation);
router.get("/getQuotation", GetQuotation);
router.get("/getQuotationAdmin", GetQuotationAdmin);
export default router;
