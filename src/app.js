const express = require('express');
const app = express();
const predictRoutes = require('./routes/predict.routes');

// Register prediction-related routes under /api
app.use('/api', predictRoutes);

// Simple check endpoint
app.get('/', (req, res) => {
    res.status(200).json({
        message: 'RealVision API running'
    });
});

module.exports = app;
