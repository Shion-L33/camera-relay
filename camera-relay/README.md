# ESP32-CAM Oracle Relay

This relay keeps only the latest JPEG frame in memory. It does not write images or videos to disk.

## Oracle setup

1. Create an Oracle Cloud Always Free VM.
2. Install Node.js LTS on the VM.
3. Copy this `camera-relay` folder to the VM.
4. Install dependencies:

```bash
npm install
```

5. Start the relay:

```bash
CAMERA_KEY=replace-with-a-secret-key PORT=3000 npm start
```

6. Open port `3000` in the Oracle VM firewall/security list, or put Nginx/Caddy in front of it with HTTPS.

Your dashboard stream URL will be:

```text
http://YOUR_ORACLE_PUBLIC_IP:3000/stream.jpg
```

## ESP32-CAM behavior

The ESP32-CAM should repeatedly capture a JPEG frame and POST it to:

```text
http://YOUR_ORACLE_PUBLIC_IP:3000/upload
```

with this header:

```text
x-camera-key: replace-with-a-secret-key
```

Keep the frame rate low for free hosting, such as 1 to 5 FPS.
