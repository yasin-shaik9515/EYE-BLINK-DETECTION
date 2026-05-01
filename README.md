
# EYE BLINK DETECTION | AI Driver Monitoring

This is a Next.js 15 application designed for real-time driver drowsiness detection using MediaPipe Face Landmarker and Google Genkit.

## Hosting Setup

For this application to function correctly (especially the Genkit Server Actions), it **MUST** be deployed using **Firebase App Hosting**.

1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Select your project: `praesentia-lite`.
3. Navigate to **App Hosting** in the left sidebar.
4. Click **Get Started** and connect your repository.
5. Follow the steps to create a new rollout.

## Features
- **Neural Blink Detection**: High-precision eye tracking.
- **Web Audio Siren**: Piercing alarms generated via Web Audio API.
- **Spectacles Compatibility**: Optimized for drivers with glasses.
- **Privacy First**: All video processing happens locally on your device.
