const path = require('path');
const request = require('supertest');
const app = require('../src/app');

const VIDEO_FIXTURE = path.join(__dirname, 'fixtures', 'sample.mp4');
const NON_VIDEO_FIXTURE = path.join(__dirname, 'fixtures', 'sample.txt');

describe('POST /api/predict', () => {
  it('returns 400 when no file is attached', async () => {
    const res = await request(app).post('/api/predict');

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ message: 'No valid video file provided' });
  });

  it('returns 400 when the attached file is not a video', async () => {
    const res = await request(app)
      .post('/api/predict')
      .attach('video', NON_VIDEO_FIXTURE);

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ message: 'No valid video file provided' });
  });

  it('returns 200 with a mock prediction for a valid video upload', async () => {
    const res = await request(app)
      .post('/api/predict')
      .attach('video', VIDEO_FIXTURE);

    expect(res.status).toBe(200);
    expect(res.headers['cache-control']).toBe('no-store');
    expect(res.body.message).toBe('Prediction successful');
    expect(['real', 'fake']).toContain(res.body.prediction);
    expect(typeof res.body.confidence).toBe('number');
    expect(res.body.confidence).toBeGreaterThanOrEqual(0.75);
    expect(res.body.confidence).toBeLessThanOrEqual(0.95);
  });
});
