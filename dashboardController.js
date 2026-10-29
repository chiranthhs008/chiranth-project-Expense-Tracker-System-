import getDateRange from "../utils/dateFilter.js";
import expenseModel from "../models/expenseModel.js";
import incomeModel from "../models/incomeModel.js";

// @desc    Get dashboard overview metrics and statistics
// @route   GET /api/dashboard/overview
// @access  Private
export const getDashboardOverview = async (req, res) => {
  try {
    const range = req.query.range || "monthly";
    const { start, end } = getDateRange(range);
    const userId = req.user;

    // Fetch incomes and expenses in date range
    const [incomes, expenses] = await Promise.all([
      incomeModel.find({
        userId,
        date: { $gte: start, $lte: end },
      }).lean(),
      expenseModel.find({
        userId,
        date: { $gte: start, $lte: end },
      }).lean(),
    ]);

    const monthlyIncome = incomes.reduce((acc, cur) => acc + Number(cur.amount || 0), 0);
    const monthlyExpense = expenses.reduce((acc, cur) => acc + Number(cur.amount || 0), 0);
    const savings = monthlyIncome - monthlyExpense;
    const savingsRate = monthlyIncome === 0 ? 0 : Math.round((savings / monthlyIncome) * 100);

    // Recent transactions sorted descending by date
    const recentTransactions = [
      ...incomes.map((i) => ({ ...i, type: "income" })),
      ...expenses.map((e) => ({ ...e, type: "expense" })),
    ]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);

    const spendByCategory = {};
    for (const exp of expenses) {
      const cat = exp.category || "Other";
      spendByCategory[cat] = (spendByCategory[cat] || 0) + Number(exp.amount || 0);
    }

    const expenseDistribution = Object.entries(spendByCategory).map(([category, amount]) => ({
      category,
      amount,
      percent: monthlyExpense === 0 ? 0 : Math.round((amount / monthlyExpense) * 100),
    }));

    res.status(200).json({
      success: true,
      data: {
        monthlyIncome,
        monthlyExpense,
        savings,
        savingsRate,
        expenseDistribution,
        recentTransactions,
      },
    });
  } catch (error) {
    console.error("Dashboard overview error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};