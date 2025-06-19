// backend/server.js

// ⭐ WAJIB: Load environment variables dari .env PALING ATAS
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

// ✅ Import semua rute
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const publicStatsRoutes = require('./routes/publicStatsRoutes');
const locationRoutes = require('./routes/locations');
const reportRoutes = require('./routes/reports');
const eventRoutes = require('./routes/events');
const partnersRoutes = require('./routes/partners');
const volunteerRoutes = require('./routes/volunteerRoutes');
const threadRoutes = require('./routes/threadRoutes');

// ✅ Import koneksi database
const { connectDB } = require('./config/db');

// ✅ Inisialisasi express app
const app = express();
const PORT = process.env.PORT || 3001;

console.log('🚀 Starting server...');

// ✅ CORS config untuk mendukung domain frontend dari Vercel & lokal
const allowedOrigins = [
  'https://s-ilogy-s-imanis-fe.vercel.app',
  'https://s-ilogy-s-imanis-fe-git-main-tiannamamus-projects.vercel.app',
  'https://s-ilogy-s-imanis-a9ffhmvjp-tiannamamus-projects.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:3001'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`❌ Blocked by CORS: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// ✅ Middleware
app.use(express.json());
app.use('/static', express.static(path.join(__dirname, 'public')));

// ✅ API Routes
app.use('/api', authRoutes);
console.log('✓ Auth routes mounted at /api');

app.use('/api/users', userRoutes);
console.log('✓ User routes mounted at /api/users');

app.use('/api/admin', adminRoutes);
console.log('✓ Admin routes mounted at /api/admin');

app.use('/api/public-stats', publicStatsRoutes);
console.log('✓ Public Stats routes mounted at /api/public-stats');

app.use('/api/locations', locationRoutes);
console.log('✓ Location routes mounted at /api/locations');

app.use('/api', reportRoutes); // Menggunakan root /api
console.log('✓ Reports routes mounted at /api');

app.use('/api/events', eventRoutes);
console.log('✓ Events routes mounted at /api/events');

app.use('/api/partners', partnersRoutes);
console.log('✓ Partners routes mounted at /api/partners');

app.use('/api', volunteerRoutes); // Sama seperti auth
console.log('✓ Volunteer routes mounted at /api');

app.use('/api/threads', threadRoutes);
console.log('✓ Threads routes mounted at /api/threads');

// ✅ Root route
app.get('/', (req, res) => {
  res.status(200).json({ message: '✅ Server is running on Railway!' });
});

// ✅ 404 Not Found
app.use((req, res, next) => {
  console.warn(`⚠️ 404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ message: 'Rute API tidak ditemukan.' });
});

// ✅ Global Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.stack);
  res.status(500).json({
    message: 'Terjadi kesalahan server internal.',
    error: err.message,
  });
});

// ✅ Start server & connect DB
const startServer = async () => {
  try {
    console.log('🔌 Connecting to database...');
    await connectDB();
    console.log('✅ Connected to PostgreSQL');

    app.listen(PORT, () => {
      console.log(`🌐 Server listening on http://localhost:${PORT}`);
      console.log(`🔐 JWT Secret: ${process.env.JWT_SECRET ? 'Loaded' : 'NOT LOADED - Check .env file!'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
