# Realvision-backend
 
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

## Current Progress
- Express backend setup
- REST API structure
- Video upload endpoint with Multer
- Temporary file storage in `uploads/`

## Next Steps
- File validation (type and size)
- Python inference integration
- Temporary file cleanup after processing
