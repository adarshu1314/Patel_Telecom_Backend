import express from "express";
import multer from "multer";
import { uploadCSV } from "../middleware/upload";
import { downloadTemplate, uploadProducts } from "../controller/productbulk";

const router = express.Router();

const upload = multer({ dest: "uploads/" });

// Download CSV template (protected)
console.log("Product Bulk Routes Loaded");
router.get("/template", downloadTemplate);

// Upload CSV file (protected)
console.log("Product Bulk Upload Route Loaded");
router.post("/upload", uploadCSV, uploadProducts);

export default router;