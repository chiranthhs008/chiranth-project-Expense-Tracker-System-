import express from "express";
import {
  getIncomes,
  getIncomeOverview,
  addIncome,
  updateIncome,
  deleteIncome,
} from "../controllers/incomeController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/get", protect, getIncomes);
router.get("/overview", protect, getIncomeOverview);
router.post("/add", protect, addIncome);
router.put("/update/:id", protect, updateIncome);
router.delete("/delete/:id", protect, deleteIncome);

export default router;
