import express from "express";
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  updatePassword,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", registerUser);
router.post("/login", loginUser);
router.get("/profile", protect, getUserProfile);
router.put("/update", protect, updateUserProfile);
router.put("/update-password", protect, updatePassword);

export default router;
