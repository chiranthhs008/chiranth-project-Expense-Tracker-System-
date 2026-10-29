import express from "express";
import {
  getExpenses,
  getExpenseOverview,
  addExpense,
  updateExpense,
  deleteExpense,
} from "../controllers/expenseController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/get", protect, getExpenses);
router.get("/overview", protect, getExpenseOverview);
router.post("/add", protect, addExpense);
router.put("/update/:id", protect, updateExpense);
router.delete("/delete/:id", protect, deleteExpense);

export default router;
