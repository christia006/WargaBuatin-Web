const Report = require('../models/Report'); // Adjust path as needed

exports.getAllReports = async (req, res) => {
  try {
    const reports = await Report.findAll();
    res.json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: 'Gagal mengambil data laporan' });
  }
};

exports.createReport = async (req, res) => {
  try {
    // photo_url/photo_base64 is removed from req.body destructuring
    const { location, description, latitude, longitude } = req.body;

    // Make latitude and longitude optional for backend validation
    // They can be null if not provided by the frontend directly (meaning frontend will geocode)
    if (!location || !description) {
      return res.status(400).json({ message: 'Lokasi dan deskripsi harus diisi.' });
    }

    // Ensure latitude and longitude are numbers or null
    const finalLatitude = latitude ? parseFloat(latitude) : null;
    const finalLongitude = longitude ? parseFloat(longitude) : null;

    // Check if parseFloat resulted in NaN for non-null values
    if (latitude !== null && isNaN(finalLatitude)) {
      return res.status(400).json({ message: 'Format lintang tidak valid.' });
    }
    if (longitude !== null && isNaN(finalLongitude)) {
      return res.status(400).json({ message: 'Format bujur tidak valid.' });
    }

    const newReport = await Report.create({
      location,
      description,
      latitude: finalLatitude, // Use parsed or null value
      longitude: finalLongitude, // Use parsed or null value
      // photo_url is no longer passed here
    });
    res.status(201).json(newReport);
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({ message: 'Gagal membuat laporan baru' });
  }
};