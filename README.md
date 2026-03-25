# RealVision Backend API

Backend-first project for the RealVision system, designed to support video upload, validation, Python-based inference flow, and a minimal frontend demo for real/fake video prediction.

---

## Current Stack
- Node.js
- Express.js
- Multer
- Python
- Vanilla HTML / CSS / JavaScript

## Current Endpoints
- `GET /` - API health check
- `POST /api/predict` - upload a video file, validate it, run Python mock inference, and return prediction JSON

## Run Locally
```bash
npm install
node src/server.js
```
## Current Functionality
- Express backend setup

- REST API structure

- Video upload endpoint with Multer

- Temporary file storage in uploads/

- File type validation (video only)

- File size limit (50MB)

- Python mock inference integration

- Prediction response with:

  - message

  - prediction

  - confidence

- Temporary file cleanup after processing

- Minimal frontend demo for video upload and prediction display

## API Response Example

```
{
  "message": "Prediction successful",
  "prediction": "real",
  "confidence": 0.87
}
```

### Validation Examples


The backend currently supports video upload with validation checks for file type and file size.



### Invalid file type


Non-video files are rejected with an error response.

### File size limit validation


Files that exceed the configured size limit are rejected with an error response.

### Successful prediction flow


A valid video file is accepted, processed through the Python mock inference layer, and returns a prediction response.

## Frontend Demo


The project includes a minimal frontend demo that allows a user to:

- choose a video file

- upload it to the backend

- receive prediction results

- view confidence score

- view validation / inference errors

## Project Status

This project currently uses a Python mock inference layer.
The backend and demo frontend are working end-to-end, and the next major step would be replacing the mock inference with the real trained model.

## Planned Improvements
- Replace mock inference with real model integration
- Deploy the project for external access
- Improve frontend UI/UX further
- Consider optional persistence/history only if needed

## Author

GitHub:[Menaluc](https://github.com/Menaluc)
