// models/reports.js
const { pool } = require('../config/db'); // Pastikan path ke db.js benar

module.exports = {
  /**
   * Mengambil semua laporan dari tabel 'reports'
   */
  async findAll() {
    const query = 'SELECT * FROM reports ORDER BY created_at DESC';
    const { rows } = await pool.query(query);
    return rows;
  },

  /**
   * Mengambil laporan berdasarkan ID
   * @param {number} id - ID dari laporan
   */
  async findById(id) {
    const query = 'SELECT * FROM reports WHERE id = $1';
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  },

  /**
   * Membuat laporan baru
   * @param {object} data - Data laporan (reporter_name, location, damage_type, description, incident_date)
   */
  async create({ reporter_name, location, damage_type, description, incident_date }) {
    const query = `
      INSERT INTO reports (reporter_name, location, damage_type, description, incident_date)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [reporter_name, location, damage_type, description, incident_date];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  /**
   * Menghapus laporan berdasarkan ID
   * @param {number} id - ID laporan
   */
  async delete(id) {
    const query = 'DELETE FROM reports WHERE id = $1 RETURNING *';
    const { rows } = await pool.query(query, [id]);
    return rows[0]; // Mengembalikan laporan yang dihapus
  },

  /**
   * Memperbarui laporan berdasarkan ID
   * @param {number} id - ID laporan
   * @param {object} data - Data yang diperbarui
   */
  async update(id, { reporter_name, location, damage_type, description, incident_date }) {
    const query = `
      UPDATE reports
      SET reporter_name = $1,
          location = $2,
          damage_type = $3,
          description = $4,
          incident_date = $5
      WHERE id = $6
      RETURNING *
    `;
    const values = [reporter_name, location, damage_type, description, incident_date, id];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },
};