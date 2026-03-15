# Realvision-backend
 
Backend API for the RealVision project.
This service is being built to allow video upload and prediction of whether a video is real or fake using a deep learning model.

## Current Stack
- Node.js
- Express.js

## Current Endpoints
- `GET /` - health check
- `POST /api/predict` - test prediction endpoint

## Run Locally
```bash
npm install
node src/server.js
