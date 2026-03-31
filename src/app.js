const express = require('express');
const path = require('path');
const app = express();
const predictRoutes = require('./routes/predict.routes');
const errorMiddleware = require('./middleware/error.middleware');

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

app.use('/demo', express.static(path.join(__dirname, '../public')));

// Register prediction-related routes under /api
app.use('/api', predictRoutes);

// Keep a simple health endpoint under /api/health.
app.get('/api/health', (req, res) => {
    res.status(200).json({
        message: 'RealVision API running'
    });
});

// Serve the demo page at root.
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.use(errorMiddleware);

module.exports = app;
