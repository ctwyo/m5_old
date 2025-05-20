// routes/equipmentRoutes.js
import express from "express";
import {
  createEquipment,
  getEquipment,
  updateEquipmentStatus,
} from "../controllers/equipmentController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, createEquipment);
router.get("/", protect, getEquipment);
router.patch("/:id", protect, updateEquipmentStatus);

export default router;
