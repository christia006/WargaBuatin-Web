// backend/controllers/locationController.js
const Location = require('../models/Location'); // Import the Location model

/**
 * @desc Get all locations
 * @route GET /api/locations
 * @access Public
 */
exports.getAllLocations = async (req, res) => {
  try {
    const locations = await Location.findAll();
    res.json(locations);
  } catch (error) {
    console.error('Error in getAllLocations:', error.message);
    res.status(500).json({ message: 'Gagal mengambil data lokasi', error: error.message });
  }
};

/**
 * @desc Create a new location
 * @route POST /api/locations
 * @access Public (or authenticated, depending on your needs)
 */
exports.createLocation = async (req, res) => {
  try {
    const { name, description, latitude, longitude } = req.body;
    // Basic validation
    if (!name || !description || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ message: 'Nama, deskripsi, latitude, dan longitude diperlukan.' });
    }
    const newLoc = await Location.create({ name, description, latitude, longitude });
    res.status(201).json(newLoc);
  } catch (error) {
    console.error('Error in createLocation:', error.message);
    res.status(500).json({ message: 'Gagal membuat lokasi baru', error: error.message });
  }
};

/**
 * @desc Update an existing location
 * @route PUT /api/locations/:id
 * @access Public (or authenticated)
 */
exports.updateLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body; // Contains name, description, latitude, longitude
    const loc = await Location.update(id, updatedData);
    if (!loc) {
      return res.status(404).json({ message: 'Lokasi tidak ditemukan' });
    }
    res.json(loc);
  } catch (error) {
    console.error('Error in updateLocation:', error.message);
    res.status(500).json({ message: 'Gagal mengupdate lokasi', error: error.message });
  }
};

/**
 * @desc Delete a location
 * @route DELETE /api/locations/:id
 * @access Public (or authenticated)
 */
exports.deleteLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const loc = await Location.delete(id);
    if (!loc) {
      return res.status(404).json({ message: 'Lokasi tidak ditemukan' });
    }
    res.json({ message: 'Lokasi berhasil dihapus', deletedLocation: loc });
  } catch (error) {
    console.error('Error in deleteLocation:', error.message);
    res.status(500).json({ message: 'Gagal menghapus lokasi', error: error.message });
  }
};
