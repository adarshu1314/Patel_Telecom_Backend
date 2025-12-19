
import express from "express";
import { CreateQuotation } from "../controller/quotation";

const router = express.Router();

router.post("/create", CreateQuotation);

export default router;
