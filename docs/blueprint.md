# **App Name**: VigilantDrive

## Core Features:

- Real-time Camera Feed Integration: Utilize the user's device camera (webcam or mobile camera) to capture and display a live video feed for continuous drowsiness detection.
- Facial Landmark Detection: Integrate the 'face_landmarker.task' MediaPipe model, via the provided URL (https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task), to accurately identify and track key facial landmarks from the live camera feed.
- Drowsiness State Analysis Tool: A proprietary AI tool that continuously processes real-time facial landmark data to analyze metrics like eye aspect ratio, blink rate, and head pose, interpreting these to determine the user's current level of alertness or drowsiness.
- Configurable Alert System: Implement an audible alarm and clear visual warnings on the screen that activate when the system detects signs of drowsiness. Users can customize sensitivity levels for these alerts.
- Live Alertness Monitor: Provide a clean, focused user interface displaying the current alertness status (e.g., 'Awake', 'Drowsy'), along with visual feedback indicating the system's active monitoring.
- ML Model Initialization & Management: Handle the efficient loading, initialization, and lifecycle management of the MediaPipe 'face_landmarker.task' model, ensuring it's ready for real-time inference in the web environment.

## Style Guidelines:

- Primary color: A cool, balanced blue (#2694D9) to evoke alertness and clarity, suitable for headings and interactive elements.
- Background color: A very light, desaturated blue (#ECF5F8) to maintain a sense of calm focus and professionalism.
- Accent color: A vibrant, analogous teal-green (#10B395) for important call-to-action buttons or highlight indicators.
- Body and headline font: 'Inter' (sans-serif) for its clear, modern, and highly readable appearance, promoting ease of understanding during use.
- Utilize minimalist line icons that are immediately recognizable and related to monitoring, safety, and alerts, ensuring clarity even at a glance.
- A clean, unobtrusive layout that prioritizes the live camera feed and current status, minimizing distractions for the user. It should be fully responsive for desktop and mobile browser use.
- Subtle, non-distracting animations for status updates and transitions (e.g., a smooth fade for an alert banner, a gentle pulse on an alert indicator) to provide feedback without adding cognitive load.