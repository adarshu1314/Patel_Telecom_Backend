import express from "express";
import { SearchProducts, GetAllProducts, GetProductById } from "../controller/product";

const router = express.Router();

router.get("/all", GetAllProducts);
router.get("/search", SearchProducts);
router.get("/:id", GetProductById);

export default router;
