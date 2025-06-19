// backend/routes/volunteerRoutes.js
const express = require('express');
const { getAllVolunteers, createVolunteer } = require('../controllers/volunteerController');

const router = express.Router();

router.get('/volunteers', getAllVolunteers);
router.post('/volunteers', createVolunteer);

module.exports = router;