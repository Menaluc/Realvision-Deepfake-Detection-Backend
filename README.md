# Realvision Deepfake Detection Backend
 
Backend API for the RealVision project.
This service is being built to allow video upload and prediction of whether a video is real or fake using a deep learning model.

## Current Stack
- Node.js
- Express.js
- Multer

## Current Endpoints
- `GET /` - API health check
- `POST /api/predict` - upload a video file and return uploaded file details

## Run Locally
```bash
npm install
node src/server.js

## Current Functionality
- Express backend setup
- REST API structure
- Video upload endpoint with Multer
- Temporary file storage in `uploads/`

## Planned Improvements
- File validation by type and size
- Integration with Python inference pipeline
- Temporary file cleanup after processing
- Return prediction result and confidence score

