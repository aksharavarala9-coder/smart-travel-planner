const Review = require('../models/Review');

// @desc    Get all reviews or reviews by destination
// @route   GET /api/reviews
// @access  Public
exports.getReviews = async (req, res) => {
    try {
        let query = {};
        if (req.query.destination) {
            query.destination = req.query.destination;
        }

        const reviews = await Review.find(query).sort('-createdAt');
        res.status(200).json({ success: true, count: reviews.length, data: reviews });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private
exports.createReview = async (req, res) => {
    try {
        req.body.user = req.user.id;
        req.body.username = req.user.name;

        const review = await Review.create(req.body);
        res.status(201).json({ success: true, data: review });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
