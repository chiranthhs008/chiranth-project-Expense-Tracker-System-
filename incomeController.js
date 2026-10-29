import incomeModel from "../models/incomeModel.js";
import getDateRange from "../utils/dateFilter.js";

// @desc    Get all incomes for the current user
// @route   GET /api/income/get
// @access  Private
export const getIncomes = async (req, res) => {
  try {
    const incomes = await incomeModel.find({ userId: req.user }).sort({ date: -1 });
    res.status(200).json({ success: true, data: incomes });
  } catch (error) {
    console.error("Get incomes error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get income overview and stats
// @route   GET /api/income/overview
// @access  Private
export const getIncomeOverview = async (req, res) => {
  try {
    const range = req.query.range || "monthly";
    const { start, end } = getDateRange(range);
    const userId = req.user;

    const incomes = await incomeModel.find({
      userId,
      date: { $gte: start, $lte: end },
    }).sort({ date: -1 });

    const totalIncome = incomes.reduce((acc, cur) => acc + (Number(cur.amount) || 0), 0);
    const averageIncome =
      incomes.length > 0 ? Math.round(totalIncome / incomes.length) : 0;
    const numberOfTransactions = incomes.length;
    const recentTransactions = incomes.slice(0, 10);

    res.status(200).json({
      success: true,
      data: {
        totalIncome,
        averageIncome,
        numberOfTransactions,
        recentTransactions,
        range,
      },
    });
  } catch (error) {
    console.error("Get income overview error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add a new income
// @route   POST /api/income/add
// @access  Private
export const addIncome = async (req, res) => {
  try {
    const { description, amount, category, date } = req.body;

    if (!description || amount === undefined || !category || !date) {
      return res.status(400).json({ success: false, message: "Please provide all required fields" });
    }

    const income = await incomeModel.create({
      description,
      amount: Number(amount),
      category,
      date: new Date(date),
      userId: req.user,
      type: "income",
    });

    res.status(201).json({ success: true, data: income });
  } catch (error) {
    console.error("Add income error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update an income
// @route   PUT /api/income/update/:id
// @access  Private
export const updateIncome = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, amount, category, date } = req.body;

    let income = await incomeModel.findById(id);

    if (!income) {
      return res.status(404).json({ success: false, message: "Income not found" });
    }

    // Check ownership
    if (income.userId.toString() !== req.user) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    income.description = description || income.description;
    income.amount = amount !== undefined ? Number(amount) : income.amount;
    income.category = category || income.category;
    income.date = date ? new Date(date) : income.date;

    const updatedIncome = await income.save();

    res.status(200).json({ success: true, data: updatedIncome });
  } catch (error) {
    console.error("Update income error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete an income
// @route   DELETE /api/income/delete/:id
// @access  Private
export const deleteIncome = async (req, res) => {
  try {
    const { id } = req.params;

    const income = await incomeModel.findById(id);

    if (!income) {
      return res.status(404).json({ success: false, message: "Income not found" });
    }

    // Check ownership
    if (income.userId.toString() !== req.user) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    await incomeModel.deleteOne({ _id: id });

    res.status(200).json({ success: true, message: "Income deleted successfully" });
  } catch (error) {
    console.error("Delete income error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};