const Trip = require('../models/Trip');

// @desc    Create a trip
// @route   POST /api/trips
// @access  Private
exports.createTrip = async (req, res) => {
    try {
        req.body.user = req.user.id;
        
        // Mock AI Itinerary Generator 
        const { destination, days, budget, travelType } = req.body;
        
        let generatedItinerary = [];
        
        // Define some realistic-sounding activity templates for variety
        const morningActivities = [
            `Visit the iconic landmarks of ${destination}`,
            `Early morning nature walk or hike in ${destination}`,
            `Explore the historic old town streets of ${destination}`,
            `Visit a local museum or cultural exhibition`,
            `Enjoy a traditional local breakfast and a guided city tour`
        ];
        
        const afternoonActivities = [
            `Have authentic lunch and explore local artisan markets`,
            `Visit a popular shopping district in ${destination}`,
            `Relaxing afternoon at a scenic spot in ${destination}`,
            `Interactive local workshop or cooking class`,
            `Visit nearby tourist attractions and hot spots`
        ];
        
        const eveningActivities = [
            `Enjoy dinner at a highly-rated local restaurant`,
            `Experience the vibrant nightlife of ${destination}`,
            `Catch a local cultural performance or show`,
            `Evening stroll and street food tasting`,
            `Relax at a premium cafe/lounge to end the day`
        ];

        for (let i = 1; i <= days; i++) {
            // Pick a random or pseudo-random activity based on indices
            const morning = morningActivities[(i + destination.length) % morningActivities.length];
            const afternoon = afternoonActivities[(i * 2) % afternoonActivities.length];
            const evening = eveningActivities[(i + 3) % eveningActivities.length];
            
            // Adjust tone based on travel type
            let modifier = '';
            if (travelType === 'family') modifier = ' (Family-friendly)';
            if (travelType === 'friends') modifier = ' (Group fun)';
            if (travelType === 'solo') modifier = ' (Great for solo travelers)';
            if (travelType === 'couple') modifier = ' (Romantic setting)';

            generatedItinerary.push({
                day: i,
                activities: [
                    `Morning: ${morning}${modifier}`,
                    `Afternoon: ${afternoon}${modifier}`,
                    `Evening: ${evening}${modifier}`
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
