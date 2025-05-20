// routes/warehouseRoutes.js
import express from "express";
import {
  createWarehouse,
  getWarehouses,
  getWarehouseById,
} from "../controllers/warehouseController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, createWarehouse);
router.get("/", protect, getWarehouses);
router.get("/:id", protect, getWarehouseById);

export default router;
