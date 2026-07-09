const express = require('express');

const app = express();
const port = Number(process.env.PORT || 3000);
const cameraKey = process.env.CAMERA_KEY || 'change-this-key';

let latestFrame = null;
let latestFrameAt = 0;

app.use(express.raw({
  type: ['image/jpeg', 'application/octet-stream'],
  limit: process.env.MAX_FRAME_SIZE || '600kb',
}));

app.get('/', (_req, res) => {
  res.type('text/plain').send('ESP32-CAM relay is running. Use /stream.jpg for live view.');
});

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    hasFrame: Boolean(latestFrame),
    latestFrameAt,
    ageMs: latestFrameAt ? Date.now() - latestFrameAt : null,
  });
});

app.get('/favicon.ico', (_req, res) => {
  const favicon = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAIAAeIhvAAAAAElFTkSuQmCC', 'base64');
  res.type('image/x-icon').send(favicon);
});
app.post('/upload', (req, res) => {
  if (req.get('x-camera-key') !== cameraKey) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
    return res.status(400).json({ error: 'missing jpeg frame' });
  }

  latestFrame = Buffer.from(req.body);
  latestFrameAt = Date.now();
  res.status(204).end();
});

app.get('/stream.jpg', (_req, res) => {
  if (!latestFrame) {
    res.status(503).type('text/plain').send('No camera frame received yet.');
    return;
  }

  res.set({
    'Content-Type': 'image/jpeg',
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
  });
  res.end(latestFrame);
});

app.listen(port, () => {
  console.log(`ESP32-CAM relay listening on port ${port}`);
});
