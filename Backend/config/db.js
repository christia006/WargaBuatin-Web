require('dotenv').config();

// backend/config/db.js
const { Pool } = require('pg');
require('dotenv').config();
const bcrypt = require('bcryptjs'); // Pastikan bcryptjs diimpor di sini

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const connectDB = async () => {
    let client;
    try {
        console.log('Attempting to connect to database...');
        client = await pool.connect();
        console.log('✅ Connected to PostgreSQL successfully');

        const result = await client.query('SELECT NOW()');
        console.log('✅ Database test query successful:', result.rows[0].now);

        await initializeTables(client);
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        throw error;
    } finally {
        if (client) {
            client.release();
        }
    }
};

const initializeTables = async (client) => {
    try {
        console.log('Initializing database tables...');

        // --- Create users table (updated to include 'role') ---
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                daerah VARCHAR(255) NOT NULL,
                umur INT NOT NULL,
                pertanyaan_keamanan VARCHAR(255) NOT NULL,
                jawaban_keamanan VARCHAR(255) NOT NULL,
                role VARCHAR(50) DEFAULT 'user' NOT NULL, -- Pastikan kolom role ada
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);
        await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username)`);
        console.log('✅ "users" table checked/created.');

        // --- Add a dummy user and a dummy admin for testing login if table is empty ---
        const userCountResult = await client.query('SELECT COUNT(*) FROM users');
        if (parseInt(userCountResult.rows[0].count) === 0) {
            console.log('Adding dummy user and admin for testing...');
            const hashedPasswordUser = await bcrypt.hash('password123', 10);
            const hashedAnswerUser = await bcrypt.hash('blue', 10);
            const hashedPasswordAdmin = await bcrypt.hash('1945', 10); // ⭐ Password '1945' di-hash untuk admin ⭐
            const hashedAnswerAdmin = await bcrypt.hash('green', 10);

            await client.query(`
                INSERT INTO users (username, password, daerah, umur, pertanyaan_keamanan, jawaban_keamanan, role)
                VALUES
                    ('testuser', $1, 'Medan', 25, 'What is your favorite color?', $2, 'user'),
                    ('adminuser', $3, 'Jakarta', 30, 'What is your favorite animal?', $4, 'admin') -- ⭐ Username: 'adminuser', Password: '1945', Role: 'admin' ⭐
            `, [hashedPasswordUser, hashedAnswerUser, hashedPasswordAdmin, hashedAnswerAdmin]);
            console.log('Dummy user "testuser" (password: password123) and dummy admin "adminuser" (password: 1945) added.');
        }
        // Pastikan tabel lainnya juga diinisialisasi di sini jika belum.
        // Bagian ini sudah ada di kode Anda sebelumnya.
        await client.query(`
          CREATE TABLE IF NOT EXISTS events (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            date TIMESTAMP NOT NULL,
            location VARCHAR(255) NOT NULL,
            description TEXT NOT NULL,
            capacity INTEGER NOT NULL CHECK (capacity > 0),
            registered INTEGER DEFAULT 0 CHECK (registered >= 0),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_events_date ON events(date)`);
        console.log('✅ "events" table checked/created.');

        const eventCount = await client.query('SELECT COUNT(*) FROM events');
        if (parseInt(eventCount.rows[0].count) === 0) {
          console.log('Adding sample events data...');
          await client.query(`
            INSERT INTO events (title, date, location, description, capacity, registered)
            VALUES
              ('Penanaman Pohon Mangrove', '2024-12-15 08:00:00', 'Pantai Tanjung Balai', 'Kegiatan penanaman pohon mangrove untuk menjaga ekosistem pantai', 50, 15),
              ('Reboisasi Hutan Kota', '2024-12-20 07:30:00', 'Hutan Kota Medan', 'Program reboisasi untuk menghijaukan kembali hutan kota', 30, 8),
              ('Tanam Pohon di Sekolah', '2024-12-25 09:00:00', 'SDN 123 Medan', 'Kegiatan menanam pohon buah di lingkungan sekolah', 40, 20)
          `);
          console.log('Sample events data added.');
        }

        await client.query(`
          CREATE TABLE IF NOT EXISTS reports (
            id SERIAL PRIMARY KEY,
            reporter_name VARCHAR(255) NOT NULL,
            location VARCHAR(255) NOT NULL,
            damage_type VARCHAR(255) NOT NULL,
            description TEXT NOT NULL,
            incident_date DATE NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          )
        `);
        console.log('✅ "reports" table checked/created.');

        await client.query(`CREATE INDEX IF NOT EXISTS idx_reports_location ON reports(location)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_reports_incident_date ON reports(incident_date)`);
        console.log('✅ Indexes for "reports" table checked/created.');

        const reportCount = await client.query('SELECT COUNT(*) FROM reports');
        if (parseInt(reportCount.rows[0].count) === 0) {
          console.log('Adding sample reports data...');
          await client.query(`
            INSERT INTO reports (reporter_name, location, damage_type, description, incident_date)
            VALUES
              ('Budi Santoso', 'Sungai Ciliwung', 'Pencemaran Air', 'Banyak sampah plastik dan limbah industri di sungai.', '2024-05-10'),
              ('Siti Aminah', 'Taman Kota', 'Penebangan Liar', 'Ditemukan beberapa pohon yang ditebang tanpa izin.', '2024-06-01'),
              ('Ahmad Fauzi', 'Pantai Indah', 'Kerusakan Terumbu Karang', 'Nelayan menggunakan bom ikan merusak terumbu karang.', '2024-05-20')
          `);
          console.log('Sample reports data added.');
        }

        await client.query(`
          CREATE TABLE IF NOT EXISTS bank_sampah_partners (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            phone VARCHAR(50) NOT NULL,
            address TEXT,
            message TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
        `);
        console.log('✅ "bank_sampah_partners" table checked/created.');

        const partnerCount = await client.query('SELECT COUNT(*) FROM bank_sampah_partners');
        if (parseInt(partnerCount.rows[0].count) === 0) {
          console.log('Adding sample bank_sampah_partners data...');
          await client.query(`
            INSERT INTO bank_sampah_partners (name, email, phone, address, message)
            VALUES
              ('Bank Sampah Hijau', 'hijau@banksampah.com', '081234567890', 'Jl. Merdeka No. 10, Jakarta', 'Mitra pengelola sampah organik dan anorganik.'),
              ('Unit Daur Ulang Mandiri', 'daurulang@banksampah.com', '085678901234', 'Jl. Pahlawan No. 5, Surabaya', 'Fokus pada daur ulang kertas dan plastik.'),
              ('Pusat Komunitas Lingkungan', 'komunitas@banksampah.com', '087890123456', 'Jl. Raya No. 1, Bandung', 'Menerima berbagai jenis sampah dan mengadakan workshop daur ulang.')
          `);
          console.log('Sample bank_sampah_partners data added.');
        }

        await client.query(`
          CREATE TABLE IF NOT EXISTS daftarrelawan (
            id SERIAL PRIMARY KEY,
            nama VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            daerah VARCHAR(255) NOT NULL,
            aksi TEXT NOT NULL,
            motivasi TEXT NOT NULL,
            foto VARCHAR(255),
            bergabung TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        console.log('✅ "daftarrelawan" table checked/created.');

        const relawanCount = await client.query('SELECT COUNT(*) FROM daftarrelawan');
        if (parseInt(relawanCount.rows[0].count) === 0) {
          console.log('Adding sample daftarrelawan data...');
          await client.query(`
            INSERT INTO daftarrelawan (nama, email, daerah, aksi, motivasi)
            VALUES
              ('Dewi Lestari', 'dewi.l@example.com', 'Jakarta', 'Program Penanaman Pohon', 'Ingin berkontribusi pada lingkungan hidup.'),
              ('Rizky Pratama', 'rizky.p@example.com', 'Bandung', 'Pembersihan Sungai', 'Melihat sungai yang bersih adalah impian saya.'),
              ('Putri Ayu', 'putri.a@example.com', 'Yogyakarta', 'Edukasi Lingkungan', 'Menyebarkan kesadaran lingkungan kepada generasi muda.')
          `);
          console.log('Sample daftarrelawan data added.');
        }

        await client.query(`
          CREATE TABLE IF NOT EXISTS locations (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT NOT NULL,
            latitude NUMERIC(10, 8) NOT NULL,
            longitude NUMERIC(11, 8) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_locations_name ON locations(name)`);
        console.log('✅ "locations" table checked/created.');

        const locationCount = await client.query('SELECT COUNT(*) FROM locations');
        if (parseInt(locationCount.rows[0].count) === 0) {
          console.log('Adding sample locations data...');
          await client.query(`
            INSERT INTO locations (name, description, latitude, longitude)
            VALUES
              ('Taman Lingkungan Hijau', 'Lokasi penanaman pohon dan edukasi lingkungan.', -6.2088, 106.8456),
              ('Pusat Daur Ulang Mandiri', 'Bank sampah aktif dengan program daur ulang inovatif.', -6.1754, 106.8270),
              ('Area Konservasi Mangrove', 'Wilayah konservasi mangrove yang dilindungi.', -6.0000, 106.9000),
              ('Sekolah Hijau', 'Sekolah dengan program lingkungan terpadu.', -6.2500, 106.7500),
              ('Komunitas Berkebun', 'Komunitas yang aktif dalam urban farming.', -6.3000, 106.8000)
          `);
          console.log('Sample locations data added.');
        }
        console.log('✅ All database tables initialized successfully.');
    } catch (error) {
        console.error('❌ Error initializing tables:', error.message);
        throw error;
    }
};

pool.on('error', (err) => {
    console.error('Unexpected error on idle client:', err);
});

module.exports = { pool, connectDB };