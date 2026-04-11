const Expense = require('../models/Expense');
const Trip = require('../models/Trip');

// @desc    Add expense to a trip
// @route   POST /api/expenses
// @access  Private
exports.addExpense = async (req, res) => {
    try {
        const { tripId, description, amount, paidBy, splitAmong } = req.body;
        
        // Verify trip exists and belongs to user
        const trip = await Trip.findById(tripId);
        if (!trip) {
            return res.status(404).json({ success: false, error: 'Trip not found' });
        }
        
        if (trip.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false, error: 'Not authorized to add expense to this trip' });
        }

        const expense = await Expense.create({
            trip: tripId,
            description,
            amount,
            paidBy,
            splitAmong
        });

        res.status(201).json({ success: true, data: expense });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Get expenses for a trip
// @route   GET /api/expenses/:tripId
// @access  Private
exports.getExpenses = async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.tripId);
        if (!trip) {
            return res.status(404).json({ success: false, error: 'Trip not found' });
        }

        if (trip.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false, error: 'Not authorized' });
        }

        const expenses = await Expense.find({ trip: req.params.tripId }).sort('-createdAt');
        
        // Calculate Splitwise-like balances
        // For simplicity, assuming equal split among all in `splitAmong`
        const balances = {};
        expenses.forEach(exp => {
            const splitAmount = exp.amount / exp.splitAmong.length;
            
            // Person who paid gets back
            if (!balances[exp.paidBy]) balances[exp.paidBy] = 0;
            balances[exp.paidBy] += exp.amount;

            // People involved owe
            exp.splitAmong.forEach(person => {
                if (!balances[person]) balances[person] = 0;
                balances[person] -= splitAmount;
            });
        });

        res.status(200).json({ success: true, count: expenses.length, data: expenses, balances });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
