const mongoose = require('mongoose');

const TripSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    destination: {
        type: String,
        required: [true, 'Please add a destination']
    },
    days: {
        type: Number,
        required: [true, 'Please specify the number of days']
    },
    budget: {
        type: Number,
        required: [true, 'Please specify a budget']
    },
    itinerary: {
        type: Array,
        default: []
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Trip', TripSchema);
