
// backend/routes/locationRoutes.js


const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');


// Define routes relative to the mount path (e.g., /api/locations)
router.get('/', locationController.getAllLocations); // Becomes GET /api/locations
router.post('/', locationController.createLocation); // Becomes POST /api/locations
router.put('/:id', locationController.updateLocation); // Becomes PUT /api/locations/:id
router.delete('/:id', locationController.deleteLocation); // Becomes DELETE /api/locations/:id

module.exports = router; // This line is crucial for exporting the router

// ✅ GET all locations - /api/locations
router.get('/', locationController.getAllLocations);

// ✅ POST a new location - /api/locations
router.post('/', locationController.createLocation);

// ✅ PUT update location by ID - /api/locations/:id
router.put('/:id', locationController.updateLocation);

// ✅ DELETE location by ID - /api/locations/:id
router.delete('/:id', locationController.deleteLocation);

// ✅ Export router
module.exports = router;

