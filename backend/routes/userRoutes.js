// routes/userRoutes.js
import express from "express";
import { login, getUser } from "../controllers/userController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/login", login);
router.get("/me", protect, getUser);

export default router;
