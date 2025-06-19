// backend/routes/statsRoutes.js
const express = require('express');
const { getCounts } = require('../controllers/statsController');

const router = express.Router();

// Define a GET route for fetching all counts
router.get('/counts', getCounts); // This will be /api/counts when mounted at /api

module.exports = router;
