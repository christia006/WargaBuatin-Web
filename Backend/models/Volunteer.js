// backend/models/Volunteer.js
const { pool } = require('../config/db');

const Volunteer = {
  // Method to get all volunteers from the database
  findAll: async () => {
    try {
      const result = await pool.query('SELECT * FROM daftarrelawan ORDER BY created_at DESC');
      return result.rows;
    } catch (error) {
      console.error('Error in Volunteer.findAll:', error);
      throw error;
    }
  },

  // Method to create a new volunteer in the database
  create: async ({ nama, email, daerah, aksi, motivasi, foto, bergabung }) => {
    try {
      const result = await pool.query(
        `INSERT INTO daftarrelawan (nama, email, daerah, aksi, motivasi, foto, bergabung)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`, // RETURNING * returns the newly created row
        [nama, email, daerah, aksi, motivasi, foto, bergabung]
      );
      return result.rows[0]; // Return the first (and only) new row
    } catch (error) {
      console.error('Error in Volunteer.create:', error);
      // PostgreSQL unique violation error code is '23505'
      if (error.code === '23505') {
        const customError = new Error('Email sudah terdaftar.');
        customError.code = '23505'; // Attach the error code for frontend handling
        throw customError;
      }
      throw error;
    }
  },

  // You can add more methods here (e.g., findById, update, delete) if needed later
};

module.exports = Volunteer;
