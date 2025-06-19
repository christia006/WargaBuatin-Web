// backend/routes/events.js
const express = require('express');
const router = express.Router();
const { pool } = require('../config/db'); // Asumsi path ke konfigurasi database

// Middleware untuk logging request (opsional, tapi bagus untuk debugging)
router.use((req, res, next) => {
    console.log(`[Backend] ${req.method} ${req.originalUrl}`);
    next();
});

// GET all events
router.get('/', async (req, res) => {
    try {
        console.log('Fetching all events from database...');
        const result = await pool.query(`
            SELECT id, title, date, location, description, capacity, registered
            FROM events
            ORDER BY date ASC
        `);
        console.log(`✅ Found ${result.rows.length} events.`);
        res.json(result.rows);
    } catch (error) {
        console.error('❌ Error fetching events:', error);
        res.status(500).json({
            error: 'Failed to retrieve event data',
            details: error.message
        });
    }
});

// GET single event by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM events WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error(`Error fetching event with ID ${id}:`, error);
        res.status(500).json({ error: 'Failed to retrieve event data' });
    }
});

// POST new event
router.post('/', async (req, res) => {
    const { title, date, location, description, capacity } = req.body;
    console.log('Received event data for creation:', { title, date, location, description, capacity });

    if (!title || !date || !location || !description || capacity === undefined || capacity === null) {
        return res.status(400).json({
            error: 'All fields (title, date, location, description, capacity) are required',
            received: { title, date, location, description, capacity }
        });
    }
    if (typeof capacity !== 'number' || capacity <= 0) {
        return res.status(400).json({ error: 'Capacity must be a positive number.' });
    }

    try {
        const result = await pool.query(
            `INSERT INTO events (title, date, location, description, capacity)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, title, date, location, description, capacity, registered`,
            [title, date, location, description, capacity]
        );
        console.log('✅ Event created successfully:', result.rows[0]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('❌ Error creating event:', error);
        res.status(500).json({
            error: 'Failed to create event',
            details: error.message
        });
    }
});

// PATCH endpoint for event registration
router.patch('/:id/register', async (req, res) => {
    const { id } = req.params;
    // Anda bisa menambahkan logic untuk menyimpan detail pendaftar (nama, email)
    // ke tabel terpisah jika diperlukan (misal: 'registrations')
    // Untuk saat ini, hanya akan meng-increment counter 'registered'.

    try {
        console.log(`Attempting to register for event ID: ${id}`);

        const result = await pool.query(
            `UPDATE events
             SET registered = registered + 1, updated_at = CURRENT_TIMESTAMP
             WHERE id = $1 AND registered < capacity
             RETURNING id, title, registered, capacity`, // Mengembalikan kolom yang diperbarui
            [id]
        );

        if (result.rows.length === 0) {
            // Periksa apakah event tidak ditemukan atau kapasitas sudah penuh
            const checkCapacity = await pool.query('SELECT capacity, registered FROM events WHERE id = $1', [id]);
            if (checkCapacity.rows.length > 0) {
                if (checkCapacity.rows[0].registered >= checkCapacity.rows[0].capacity) {
                    return res.status(400).json({ error: 'Event capacity reached.' });
                }
            }
            return res.status(404).json({ error: 'Event not found or cannot be registered.' });
        }

        const updatedEvent = result.rows[0];
        console.log(`✅ Registration successful for event ID ${id}. New registered count: ${updatedEvent.registered}`);
        res.json({
            message: 'Registration successful',
            event: updatedEvent // Mengirim kembali data event yang diperbarui
        });
    } catch (error) {
        console.error(`❌ Error registering for event ID ${id}:`, error);
        res.status(500).json({
            error: 'Failed to register for event',
            details: error.message
        });
    }
});

// DELETE event by ID
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM events WHERE id = $1 RETURNING id, title', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }
        console.log(`✅ Event "${result.rows[0].title}" (ID: ${result.rows[0].id}) deleted successfully.`);
        res.json({ message: 'Event deleted successfully', deletedEvent: result.rows[0] });
    } catch (error) {
        console.error(`❌ Error deleting event with ID ${id}:`, error);
        res.status(500).json({ error: 'Failed to delete event', details: error.message });
    }
});


module.exports = router;