const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Initialize database (async initialization)
require('./database/db');

setTimeout(() => {
  require('./database/seed');
}, 1000);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/equipment', require('./routes/equipment'));
app.use('/api/teams', require('./routes/teams'));
app.use('/api/technicians', require('./routes/technicians'));
app.use('/api/requests', require('./routes/requests'));
app.use('/api/notes', require('./routes/notes'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'GearGuard API is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 GearGuard API server running on port ${PORT}`);
});

