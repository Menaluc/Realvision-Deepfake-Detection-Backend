# RealVision Backend API

Live Demo: [View the app here](https://realvision-deepfake-detection-backend.onrender.com)
---
Backend-first project for the RealVision system, designed to support video upload, validation, and a minimal frontend demo for real/fake video prediction using mock inference logic.

![RealVision Demo](images/demo.png)


---

## Current Stack
- Node.js
- Express.js
- Multer
- Vanilla HTML / CSS / JavaScript
- Jest + Supertest (testing)

## Current Endpoints
- `GET /` - serves the frontend demo page
- `GET /api/health` - API health check
- `POST /api/predict` - upload a video file, validate it, run mock inference, and return prediction JSON

## Local Setup

Prerequisites: Node.js (v18+ recommended) and npm.

```bash
npm install
npm start
```

`npm start` runs `node src/server.js`. Render sets `PORT` automatically in production; locally it defaults to `3000` via `src/config/index.js` if not set.

For development with auto-restart on file changes:

```bash
npm run dev
```

## Environment Variables

The project ships a `.env.example` file documenting the supported environment variables. Copy it to `.env` if you want to override defaults:

```bash
cp .env.example .env
```

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | Port the server listens on. |

No other environment variables are required to run the project locally — uploads, file size limits, and allowed extensions are currently configured directly in `src/config/index.js`.

## Running Tests

Tests are written with Jest and Supertest, and run against the Express app directly (no server process or real network calls).

```bash
npm test
```

Current coverage includes:
- `GET /api/health` returns a 200 status with the expected payload.
- `POST /api/predict` rejects requests with no file, rejects disallowed file types (including a spoofed video mimetype on a disallowed extension), and returns a mock prediction for a valid video upload.

Uploaded test fixtures are written to and cleaned up from `uploads/` automatically by the existing controller logic, so the test run does not leave temporary files behind.

## Upload Validation

`POST /api/predict` validates uploads before they reach the (mock) inference step:

- **Mimetype check** - the file's reported mimetype must start with `video/`.
- **Extension allowlist** - the file extension must be one of `.mp4`, `.mov`, `.avi`, `.webm` (configured in `src/config/index.js`). Both the mimetype and extension checks must pass; relying on mimetype alone would be insufficient since it can be spoofed by the client.
- **File size limit** - uploads larger than 50MB are rejected.
- **Safe temporary filenames** - stored files are named using `crypto.randomUUID()` plus the validated extension, rather than the user-supplied filename. This avoids predictable or unsafe filenames on disk.
- **Cleanup** - uploaded files are temporary; they are deleted after the prediction response is sent, whether the request succeeded or failed.

Requests that fail validation receive a `400` response with a JSON error message; no file is passed to the inference step in that case.

## Mock Inference Clarification

`POST /api/predict` does **not** call a real machine learning model. `src/services/inference.service.js` returns a randomized `prediction` (`real` or `fake`) and `confidence` value on every call, purely to exercise the upload/validation/response pipeline end-to-end without a Python or ML dependency. The video content itself is never analyzed.

## API Response Example

```
{
  "message": "Prediction successful",
  "prediction": "fake",
  "confidence": 0.87
}
```
Note: This is an example shape only. In demo mode, prediction/confidence values vary per request and do not reflect any actual analysis of the uploaded video.

## Frontend Demo

The project includes a minimal frontend demo that allows a user to:

- choose a video file
- upload it to the backend
- receive prediction results
- view confidence score
- view validation / inference errors

## Project Status

This project currently uses a backend mock inference layer for demo purposes. The backend and demo frontend work end-to-end, with upload validation (mimetype, extension, size, safe filenames) and a Jest/Supertest test suite in place. The next major step is integrating a real trained model (for example via Python/ML inference) in place of the mock layer.

## Planned Improvements
- Replace mock inference with real model integration
- Improve frontend UI/UX further
- Consider optional persistence/history only if needed

## Author

GitHub:[Menaluc](https://github.com/Menaluc)
