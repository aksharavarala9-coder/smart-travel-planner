const Trip = require('../models/Trip');

// @desc    Create a trip
// @route   POST /api/trips
// @access  Private
exports.createTrip = async (req, res) => {
    try {
        req.body.user = req.user.id;
        
        // Mock AI logic for itinerary generation
        const { destination, days } = req.body;
        let generatedItinerary = [];
        
        for (let i = 1; i <= days; i++) {
            generatedItinerary.push({
                day: i,
                activities: [
                    `Morning: Visit popular attractions in ${destination}`,
                    `Afternoon: Local lunch and sightseeing`,
                    `Evening: Relax at city center or dinner`
                ]
            });
        }
        req.body.itinerary = generatedItinerary;

        const trip = await Trip.create(req.body);
        res.status(201).json({ success: true, data: trip });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Get all trips for logged in user
// @route   GET /api/trips
// @access  Private
exports.getTrips = async (req, res) => {
    try {
        const trips = await Trip.find({ user: req.user.id }).sort('-createdAt');
        res.status(200).json({ success: true, count: trips.length, data: trips });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Get single trip
// @route   GET /api/trips/:id
// @access  Private
exports.getTrip = async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id);
        
        if (!trip) {
            return res.status(404).json({ success: false, error: 'Trip not found' });
        }
        
        if (trip.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false, error: 'Not authorized' });
        }

        res.status(200).json({ success: true, data: trip });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
