const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    username: {
        type: String,
        required: true
    },
    destination: {
        type: String,
        required: [true, 'Please provide a destination']
    },
    rating: {
        type: Number,
        required: [true, 'Please provide a rating from 1 to 5'],
        min: 1,
        max: 5
    },
    text: {
        type: String,
        required: [true, 'Please write your review']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Review', ReviewSchema);
