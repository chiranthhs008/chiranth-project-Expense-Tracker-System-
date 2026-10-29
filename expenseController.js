import expenseModel from "../models/expenseModel.js";
import getDateRange from "../utils/dateFilter.js";

// @desc    Get all expenses for the current user
// @route   GET /api/expense/get
// @access  Private
export const getExpenses = async (req, res) => {
  try {
    const expenses = await expenseModel.find({ userId: req.user }).sort({ date: -1 });
    res.status(200).json({ success: true, data: expenses });
  } catch (error) {
    console.error("Get expenses error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get expense overview and stats
// @route   GET /api/expense/overview
// @access  Private
export const getExpenseOverview = async (req, res) => {
  try {
    const range = req.query.range || "monthly";
    const { start, end } = getDateRange(range);
    const userId = req.user;

    const expenses = await expenseModel.find({
      userId,
      date: { $gte: start, $lte: end },
    }).sort({ date: -1 });

    const totalExpense = expenses.reduce((acc, cur) => acc + (Number(cur.amount) || 0), 0);
    const averageExpense =
      expenses.length > 0 ? Math.round(totalExpense / expenses.length) : 0;
    const numberOfTransactions = expenses.length;
    const recentTransactions = expenses.slice(0, 10);

    res.status(200).json({
      success: true,
      data: {
        totalExpense,
        averageExpense,
        numberOfTransactions,
        recentTransactions,
        range,
      },
    });
  } catch (error) {
    console.error("Get expense overview error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add a new expense
// @route   POST /api/expense/add
// @access  Private
export const addExpense = async (req, res) => {
  try {
    const { description, amount, category, date } = req.body;

    if (!description || amount === undefined || !category || !date) {
      return res.status(400).json({ success: false, message: "Please provide all required fields" });
    }

    const expense = await expenseModel.create({
      description,
      amount: Number(amount),
      category,
      date: new Date(date),
      userId: req.user,
      type: "expense",
    });

    res.status(201).json({ success: true, data: expense });
  } catch (error) {
    console.error("Add expense error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update an expense
// @route   PUT /api/expense/update/:id
// @access  Private
export const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, amount, category, date } = req.body;

    let expense = await expenseModel.findById(id);

    if (!expense) {
      return res.status(404).json({ success: false, message: "Expense not found" });
    }

    // Check ownership
    if (expense.userId.toString() !== req.user) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    expense.description = description || expense.description;
    expense.amount = amount !== undefined ? Number(amount) : expense.amount;
    expense.category = category || expense.category;
    expense.date = date ? new Date(date) : expense.date;

    const updatedExpense = await expense.save();

    res.status(200).json({ success: true, data: updatedExpense });
  } catch (error) {
    console.error("Update expense error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete an expense
// @route   DELETE /api/expense/delete/:id
// @access  Private
export const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;

    const expense = await expenseModel.findById(id);

    if (!expense) {
      return res.status(404).json({ success: false, message: "Expense not found" });
    }

    // Check ownership
    if (expense.userId.toString() !== req.user) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    await expenseModel.deleteOne({ _id: id });

    res.status(200).json({ success: true, message: "Expense deleted successfully" });
  } catch (error) {
    console.error("Delete expense error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};