const express = require('express');
const { createTrip, getTrips, getTrip } = require('../controllers/tripController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
    .post(protect, createTrip)
    .get(protect, getTrips);

router.route('/:id')
    .get(protect, getTrip);

module.exports = router;
