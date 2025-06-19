// backend/controllers/volunteerController.js
const Volunteer = require('../models/Volunteer');

// Get all volunteers
const getAllVolunteers = async (req, res) => {
  try {
    const volunteers = await Volunteer.findAll();
    res.status(200).json(volunteers);
  } catch (error) {
    console.error('Error fetching volunteers:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a new volunteer
const createVolunteer = async (req, res) => {
  const { nama, email, daerah, aksi, motivasi } = req.body;

  // Generate a random avatar URL and current date for 'bergabung'
  const foto = `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`;
  const bergabung = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  try {
    const newVolunteer = await Volunteer.create({
      nama,
      email,
      daerah,
      aksi,
      motivasi,
      foto,
      bergabung
    });
    res.status(201).json(newVolunteer);
  } catch (error) {
    console.error('Error creating volunteer:', error);
    // Check if the error is due to a unique constraint violation (PostgreSQL error code '23505')
    if (error.code === '23505' && error.message === 'Email sudah terdaftar.') {
      return res.status(409).json({ message: 'Email sudah terdaftar.' }); // 409 Conflict
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getAllVolunteers,
  createVolunteer,
};
