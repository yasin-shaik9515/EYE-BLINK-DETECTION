'use server';
/**
 * @fileOverview A Genkit flow for real-time drowsiness detection based on facial landmark data.
 * This flow receives an array of normalized facial landmarks from a client-side MediaPipe Face Landmarker model,
 * calculates metrics such as Eye Aspect Ratio (EAR) and estimates head pose, then determines
 * the driver's current alertness level.
 *
 * - realtimeDrowsinessAnalysis - A function that handles the drowsiness analysis process.
 * - RealtimeDrowsinessAnalysisInput - The input type for the realtimeDrowsinessAnalysis function.
 * - RealtimeDrowsinessAnalysisOutput - The return type for the realtimeDrowsinessAnalysis function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the schema for a single facial landmark
const NormalizedLandmarkSchema = z.object({
  x: z.number().describe('X coordinate of the landmark, normalized to [0, 1].'),
  y: z.number().describe('Y coordinate of the landmark, normalized to [0, 1].'),
  z: z.number().describe('Z coordinate of the landmark, normalized to [0, 1].'),
});

// Define the input schema for the drowsiness analysis flow
// It expects an array of facial landmarks for a single face.
// The client is responsible for running the MediaPipe Face Landmarker model
// and extracting the NormalizedLandmark[] for a detected face.
const RealtimeDrowsinessAnalysisInputSchema = z.object({
  faceLandmarks: z.array(NormalizedLandmarkSchema).describe('Array of normalized facial landmarks from MediaPipe Face Landmarker for a single face.'),
});
export type RealtimeDrowsinessAnalysisInput = z.infer<typeof RealtimeDrowsinessAnalysisInputSchema>;

// Define the output schema for the drowsiness analysis flow
const RealtimeDrowsinessAnalysisOutputSchema = z.object({
  alertnessLevel: z.enum(['Awake', 'Slightly Drowsy', 'Drowsy', 'Extremely Drowsy']).describe("The driver's current alertness level."),
  ear: z.number().describe('Calculated Eye Aspect Ratio (EAR).'),
  headPoseStatus: z.enum(['Forward', 'Tilted Left', 'Tilted Right', 'Looking Up', 'Looking Down']).describe('Estimated head pose status.'),
  warningMessage: z.string().nullable().describe('A warning message if drowsiness is detected, otherwise null.'),
});
export type RealtimeDrowsinessAnalysisOutput = z.infer<typeof RealtimeDrowsinessAnalysisOutputSchema>;

// Helper function to calculate Euclidean distance between two points
function euclideanDistance(p1: {x: number; y: number}, p2: {x: number; y: number}): number {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

// Helper function to calculate Eye Aspect Ratio (EAR)
// This calculation uses a set of 6 key landmarks around each eye.
// The specific indices are approximate for the MediaPipe Face Landmarker's 478-landmark model
// and may need fine-tuning for optimal accuracy based on the exact model output.
function calculateEAR(landmarks: z.infer<typeof NormalizedLandmarkSchema>[]): number {
  if (landmarks.length < 478) {
    // Insufficient landmark data to calculate EAR accurately.
    return 0; // Return 0 or throw an error based on desired behavior.
  }

  // MediaPipe Face Landmarker indices for eye points (approximate):
  // Left Eye (indices for outer corner, upper-inner, upper-outer, inner corner, lower-outer, lower-inner)
  const LE_OUTER_CORNER = 33;
  const LE_INNER_CORNER = 133;
  const LE_UPPER_INNER = 160; // Index 160 or 159 could be used
  const LE_UPPER_OUTER = 158; // Index 158 or 157 could be used
  const LE_LOWER_INNER = 144; // Index 144 or 145 could be used
  const LE_LOWER_OUTER = 153; // Index 153 or 154 could be used

  // Right Eye
  const RE_OUTER_CORNER = 362;
  const RE_INNER_CORNER = 263;
  const RE_UPPER_INNER = 385; // Index 385 or 384 could be used
  const RE_UPPER_OUTER = 387; // Index 387 or 388 could be used
  const RE_LOWER_INNER = 380; // Index 380 or 381 could be used
  const RE_LOWER_OUTER = 373; // Index 373 or 374 could be used

  const getPoint = (idx: number) => landmarks[idx];

  // Calculate for Left Eye
  const p_le_outer = getPoint(LE_OUTER_CORNER);
  const p_le_inner = getPoint(LE_INNER_CORNER);
  const p_le_upper_inner = getPoint(LE_UPPER_INNER);
  const p_le_upper_outer = getPoint(LE_UPPER_OUTER);
  const p_le_lower_inner = getPoint(LE_LOWER_INNER);
  const p_le_lower_outer = getPoint(LE_LOWER_OUTER);

  const ear_left_numerator = euclideanDistance(p_le_upper_inner, p_le_lower_inner) + euclideanDistance(p_le_upper_outer, p_le_lower_outer);
  const ear_left_denominator = 2 * euclideanDistance(p_le_outer, p_le_inner);
  const ear_left = ear_left_numerator / ear_left_denominator;

  // Calculate for Right Eye
  const p_re_outer = getPoint(RE_OUTER_CORNER);
  const p_re_inner = getPoint(RE_INNER_CORNER);
  const p_re_upper_inner = getPoint(RE_UPPER_INNER);
  const p_re_upper_outer = getPoint(RE_UPPER_OUTER);
  const p_re_lower_inner = getPoint(RE_LOWER_INNER);
  const p_re_lower_outer = getPoint(RE_LOWER_OUTER);

  const ear_right_numerator = euclideanDistance(p_re_upper_inner, p_re_lower_inner) + euclideanDistance(p_re_upper_outer, p_re_lower_outer);
  const ear_right_denominator = 2 * euclideanDistance(p_re_outer, p_re_inner);
  const ear_right = ear_right_numerator / ear_right_denominator;

  // Return the average EAR of both eyes
  return (ear_left + ear_right) / 2;
}

// Helper function to estimate head pose status
// This is a simplified estimation based on relative Y coordinates of eye corners for roll,
// and relative Y coordinates of nose to a virtual center for pitch.
// A more robust solution would involve PnP (Perspective-n-Point) algorithm with a 3D face model.
function estimateHeadPose(landmarks: z.infer<typeof NormalizedLandmarkSchema>[]): RealtimeDrowsinessAnalysisOutput['headPoseStatus'] {
  if (landmarks.length < 478) {
    return 'Forward'; // Default if not enough landmarks
  }

  // Key landmarks for basic head pose estimation (approximate MediaPipe indices)
  const NOSE_TIP = 1;
  const LEFT_EYE_OUTER_CORNER = 33; // Or other stable left eye point
  const RIGHT_EYE_OUTER_CORNER = 263; // Or other stable right eye point
  const MOUTH_LEFT_CORNER = 61;
  const MOUTH_RIGHT_CORNER = 291;

  const nose = landmarks[NOSE_TIP];
  const leftEye = landmarks[LEFT_EYE_OUTER_CORNER];
  const rightEye = landmarks[RIGHT_EYE_OUTER_CORNER];
  const mouthLeft = landmarks[MOUTH_LEFT_CORNER];
  const mouthRight = landmarks[MOUTH_RIGHT_CORNER];

  // Head tilt (roll) - compare Y coordinates of eye corners
  const eye_y_diff = leftEye.y - rightEye.y;
  const roll_threshold = 0.02; // Threshold for tilt sensitivity

  if (eye_y_diff > roll_threshold) {
    return 'Tilted Right'; // Left eye is higher than right
  } else if (eye_y_diff < -roll_threshold) {
    return 'Tilted Left'; // Right eye is higher than left
  }

  // Head pitch - compare nose y-coordinate to eye-mouth midpoint y-coordinate
  // This is a rough estimation assuming a relatively frontal view.
  const mid_eye_y = (leftEye.y + rightEye.y) / 2;
  const mid_mouth_y = (mouthLeft.y + mouthRight.y) / 2;
  const head_vertical_center_y = (mid_eye_y + mid_mouth_y) / 2; // Midpoint between eyes and mouth

  const pitch_threshold_down = 0.05; // Threshold for looking down
  const pitch_threshold_up = -0.05; // Threshold for looking up

  if (nose.y > head_vertical_center_y + pitch_threshold_down) {
    return 'Looking Down';
  } else if (nose.y < head_vertical_center_y + pitch_threshold_up) {
    return 'Looking Up';
  }

  return 'Forward';
}

// Main Genkit flow definition for real-time drowsiness analysis
const realtimeDrowsinessAnalysisFlow = ai.defineFlow(
  {
    name: 'realtimeDrowsinessAnalysisFlow',
    inputSchema: RealtimeDrowsinessAnalysisInputSchema,
    outputSchema: RealtimeDrowsinessAnalysisOutputSchema,
  },
  async (input) => {
    const { faceLandmarks } = input;

    // Check if enough landmarks are provided
    if (!faceLandmarks || faceLandmarks.length < 478) {
      // This case indicates incomplete data from the client.
      // A robust client-side implementation should ensure complete landmark data is sent.
      return {
        alertnessLevel: 'Awake', // Default to awake if data is insufficient
        ear: 0,
        headPoseStatus: 'Forward',
        warningMessage: 'Insufficient facial landmark data for analysis.',
      };
    }

    const ear = calculateEAR(faceLandmarks);
    const headPoseStatus = estimateHeadPose(faceLandmarks);

    let alertnessLevel: RealtimeDrowsinessAnalysisOutput['alertnessLevel'] = 'Awake';
    let warningMessage: string | null = null;

    // Drowsiness detection logic based on EAR and head pose.
    // These thresholds are illustrative and would require calibration with real-world data.
    const EAR_DROWSY_THRESHOLD = 0.25; // Example: eyes closing significantly
    const EAR_EXTREMELY_DROWSY_THRESHOLD = 0.20; // Example: eyes almost fully closed

    if (ear < EAR_EXTREMELY_DROWSY_THRESHOLD) {
      alertnessLevel = 'Extremely Drowsy';
      warningMessage = 'Extreme drowsiness detected! Please stop driving immediately.';
    } else if (ear < EAR_DROWSY_THRESHOLD) {
      alertnessLevel = 'Drowsy';
      warningMessage = 'Drowsiness detected. Consider taking a break.';
    } else if (headPoseStatus === 'Looking Down' || headPoseStatus === 'Tilted Left' || headPoseStatus === 'Tilted Right') {
      // If head pose indicates potential drowsiness even if EAR is not critically low
      alertnessLevel = 'Slightly Drowsy';
      warningMessage = 'Head posture suggests slight drowsiness. Stay focused!';
    }

    // If no specific drowsiness detected but head is not perfectly forward, provide a mild suggestion.
    if (alertnessLevel === 'Awake' && headPoseStatus !== 'Forward') {
        alertnessLevel = 'Slightly Drowsy';
        warningMessage = 'Maintain a steady head posture for optimal monitoring.';
    }


    return {
      alertnessLevel,
      ear: parseFloat(ear.toFixed(3)), // Round EAR for cleaner output
      headPoseStatus,
      warningMessage,
    };
  }
);

/**
 * Performs real-time drowsiness analysis based on facial landmark data.
 * This function wraps the Genkit flow `realtimeDrowsinessAnalysisFlow`.
 * @param input - The facial landmark data for a single frame, typically from MediaPipe Face Landmarker.
 * @returns The detected alertness level, Eye Aspect Ratio (EAR), head pose status, and a warning message if applicable.
 */
export async function realtimeDrowsinessAnalysis(input: RealtimeDrowsinessAnalysisInput): Promise<RealtimeDrowsinessAnalysisOutput> {
  return realtimeDrowsinessAnalysisFlow(input);
}
