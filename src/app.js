const express = require('express');
const path = require('path');
const app = express();
const predictRoutes = require('./routes/predict.routes');
const errorMiddleware = require('./middleware/error.middleware');

// Main Express composition: static demo, API routes, and final error middleware.
// Allow demo UI opened from file:// or another localhost port to call the API on :3000.
app.use((req, res, next) => {
  res.set('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.set('Access-Control-Allow-Headers', '*');
    return res.sendStatus(204);
  }
  next();
});

// Keep /demo for direct static serving while / stays the primary demo entry.
app.use('/demo', express.static(path.join(__dirname, '../public')));

app.use('/api', predictRoutes);

app.get('/api/health', (req, res) => {
    res.status(200).json({
        message: 'RealVision API running'
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Last in chain so thrown/forwarded errors return JSON consistently.
app.use(errorMiddleware);

module.exports = app;
