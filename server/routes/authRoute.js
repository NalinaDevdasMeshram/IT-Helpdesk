import express from "express";
const router = express.Router();
import { protect } from "../middleware/auth.js";
import {
  registerUser,
  loginUser,
  getMyDetails,
} from "../controllers/authController.js";

router.post("/register", registerUser);
router.post("/login", protect, loginUser);
router.get("/me", protect, getMyDetails);

export default router;
