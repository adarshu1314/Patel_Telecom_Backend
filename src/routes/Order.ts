
import express from "express";
import { AddOrder, GetOrder } from "../controller/Order";

const router = express.Router();

router.post("/add", AddOrder);
router.get("/get", GetOrder);

export default router;
