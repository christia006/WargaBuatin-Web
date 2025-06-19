// backend/models/Location.js
const { pool } = require('../config/db');

class Location {
  /**
   * Finds all locations in the database.
   * @returns {Promise<Array>} A promise that resolves to an array of location objects.
   */
  static async findAll() {
    try {
      const client = await pool.connect();
      const result = await client.query('SELECT id, name, description, latitude, longitude FROM locations ORDER BY id ASC');
      client.release();
      return result.rows;
    } catch (error) {
      console.error('Error finding all locations:', error.message);
      throw error;
    }
  }

  /**
   * Creates a new location in the database.
   * @param {object} data - The data for the new location (name, description, latitude, longitude).
   * @returns {Promise<object>} A promise that resolves to the newly created location object.
   */
  static async create({ name, description, latitude, longitude }) {
    try {
      const client = await pool.connect();
      const result = await client.query(
        'INSERT INTO locations (name, description, latitude, longitude) VALUES ($1, $2, $3, $4) RETURNING *',
        [name, description, latitude, longitude]
      );
      client.release();
      return result.rows[0];
    } catch (error) {
      console.error('Error creating location:', error.message);
      throw error;
    }
  }

  /**
   * Updates an existing location by its ID.
   * @param {number} id - The ID of the location to update.
   * @param {object} data - The updated data for the location.
   * @returns {Promise<object|null>} A promise that resolves to the updated location object, or null if not found.
   */
  static async update(id, { name, description, latitude, longitude }) {
    try {
      const client = await pool.connect();
      const result = await client.query(
        'UPDATE locations SET name = $1, description = $2, latitude = $3, longitude = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
        [name, description, latitude, longitude, id]
      );
      client.release();
      return result.rows[0] || null;
    } catch (error) {
      console.error(`Error updating location with ID ${id}:`, error.message);
      throw error;
    }
  }

  /**
   * Deletes a location by its ID.
   * @param {number} id - The ID of the location to delete.
   * @returns {Promise<object|null>} A promise that resolves to the deleted location object, or null if not found.
   */
  static async delete(id) {
    try {
      const client = await pool.connect();
      const result = await client.query('DELETE FROM locations WHERE id = $1 RETURNING *', [id]);
      client.release();
      return result.rows[0] || null;
    } catch (error) {
      console.error(`Error deleting location with ID ${id}:`, error.message);
      throw error;
    }
  }
}

module.exports = Location;
