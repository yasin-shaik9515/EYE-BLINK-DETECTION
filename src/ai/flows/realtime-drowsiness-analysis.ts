'use server';
/**
 * @fileOverview A Genkit flow for real-time drowsiness detection using facial landmarks and blendshapes.
 * This flow analyzes normalized facial landmarks and blendshape scores (blink detection)
 * to determine the driver's alertness level with high precision.
 *
 * - realtimeDrowsinessAnalysis - A function that handles the drowsiness analysis process.
 * - RealtimeDrowsinessAnalysisInput - The input type for the realtimeDrowsinessAnalysis function.
 * - RealtimeDrowsinessAnalysisOutput - The return type for the realtimeDrowsinessAnalysis function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const NormalizedLandmarkSchema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number(),
});

const RealtimeDrowsinessAnalysisInputSchema = z.object({
  faceLandmarks: z.array(NormalizedLandmarkSchema).describe('Array of normalized facial landmarks.'),
  blinkScores: z.object({
    left: z.number().describe('Blink score for left eye (0-1).'),
    right: z.number().describe('Blink score for right eye (0-1).'),
  }).optional().describe('Direct blendshape blink scores from MediaPipe.'),
  sensitivity: z.number().optional().default(50).describe('Sensitivity percentage (0-100) to adjust thresholds.'),
});
export type RealtimeDrowsinessAnalysisInput = z.infer<typeof RealtimeDrowsinessAnalysisInputSchema>;

const RealtimeDrowsinessAnalysisOutputSchema = z.object({
  alertnessLevel: z.enum(['Awake', 'Slightly Drowsy', 'Drowsy', 'Extremely Drowsy']).describe("The driver's current alertness level."),
  ear: z.number().describe('Calculated Eye Aspect Ratio (EAR).'),
  headPoseStatus: z.enum(['Forward', 'Tilted Left', 'Tilted Right', 'Looking Up', 'Looking Down']).describe('Estimated head pose status.'),
  warningMessage: z.string().nullable().describe('A warning message if drowsiness is detected.'),
});
export type RealtimeDrowsinessAnalysisOutput = z.infer<typeof RealtimeDrowsinessAnalysisOutputSchema>;

function euclideanDistance(p1: {x: number; y: number}, p2: {x: number; y: number}): number {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

function calculateEAR(landmarks: z.infer<typeof NormalizedLandmarkSchema>[]): number {
  if (landmarks.length < 478) return 0;
  const LE_OUTER_CORNER = 33;
  const LE_INNER_CORNER = 133;
  const LE_UPPER_INNER = 160;
  const LE_UPPER_OUTER = 158;
  const LE_LOWER_INNER = 144;
  const LE_LOWER_OUTER = 153;
  const RE_OUTER_CORNER = 362;
  const RE_INNER_CORNER = 263;
  const RE_UPPER_INNER = 385;
  const RE_UPPER_OUTER = 387;
  const RE_LOWER_INNER = 380;
  const RE_LOWER_OUTER = 373;

  const getPoint = (idx: number) => landmarks[idx];
  const p_le_outer = getPoint(LE_OUTER_CORNER);
  const p_le_inner = getPoint(LE_INNER_CORNER);
  const p_le_upper_inner = getPoint(LE_UPPER_INNER);
  const p_le_upper_outer = getPoint(LE_UPPER_OUTER);
  const p_le_lower_inner = getPoint(LE_LOWER_INNER);
  const p_le_lower_outer = getPoint(LE_LOWER_OUTER);
  const ear_left = (euclideanDistance(p_le_upper_inner, p_le_lower_inner) + euclideanDistance(p_le_upper_outer, p_le_lower_outer)) / (2 * euclideanDistance(p_le_outer, p_le_inner));

  const p_re_outer = getPoint(RE_OUTER_CORNER);
  const p_re_inner = getPoint(RE_INNER_CORNER);
  const p_re_upper_inner = getPoint(RE_UPPER_INNER);
  const p_re_upper_outer = getPoint(RE_UPPER_OUTER);
  const p_re_lower_inner = getPoint(RE_LOWER_INNER);
  const p_re_lower_outer = getPoint(RE_LOWER_OUTER);
  const ear_right = (euclideanDistance(p_re_upper_inner, p_re_lower_inner) + euclideanDistance(p_re_upper_outer, p_re_lower_outer)) / (2 * euclideanDistance(p_re_outer, p_re_inner));

  return (ear_left + ear_right) / 2;
}

function estimateHeadPose(landmarks: z.infer<typeof NormalizedLandmarkSchema>[]): RealtimeDrowsinessAnalysisOutput['headPoseStatus'] {
  if (landmarks.length < 478) return 'Forward';
  const nose = landmarks[1];
  const leftEye = landmarks[33];
  const rightEye = landmarks[263];
  const mouthLeft = landmarks[61];
  const mouthRight = landmarks[291];

  const eye_y_diff = leftEye.y - rightEye.y;
  if (eye_y_diff > 0.02) return 'Tilted Right';
  if (eye_y_diff < -0.02) return 'Tilted Left';

  const mid_eye_y = (leftEye.y + rightEye.y) / 2;
  const mid_mouth_y = (mouthLeft.y + mouthRight.y) / 2;
  const head_center_y = (mid_eye_y + mid_mouth_y) / 2;

  if (nose.y > head_center_y + 0.05) return 'Looking Down';
  if (nose.y < head_center_y - 0.05) return 'Looking Up';
  return 'Forward';
}

const realtimeDrowsinessAnalysisFlow = ai.defineFlow(
  {
    name: 'realtimeDrowsinessAnalysisFlow',
    inputSchema: RealtimeDrowsinessAnalysisInputSchema,
    outputSchema: RealtimeDrowsinessAnalysisOutputSchema,
  },
  async (input) => {
    const { faceLandmarks, blinkScores, sensitivity = 50 } = input;
    if (!faceLandmarks || faceLandmarks.length < 478) {
      return { alertnessLevel: 'Awake', ear: 0, headPoseStatus: 'Forward', warningMessage: 'No face detected.' };
    }

    const ear = calculateEAR(faceLandmarks);
    const headPoseStatus = estimateHeadPose(faceLandmarks);
    
    // Scale thresholds based on sensitivity (0-100)
    // High sensitivity (100) -> Lower threshold (reacts sooner)
    // Low sensitivity (0) -> Higher threshold (needs more definitive closure)
    const sensFactor = sensitivity / 100;
    const extremeThreshold = 0.90 - (sensFactor * 0.15); // 0.75 to 0.90
    const drowsyThreshold = 0.65 - (sensFactor * 0.25); // 0.40 to 0.65
    const earThreshold = 0.18 + (sensFactor * 0.06); // 0.18 to 0.24

    const avgBlink = blinkScores ? (blinkScores.left + blinkScores.right) / 2 : (ear < 0.22 ? 1 : 0);
    
    let alertnessLevel: RealtimeDrowsinessAnalysisOutput['alertnessLevel'] = 'Awake';
    let warningMessage: string | null = null;

    if (avgBlink > extremeThreshold || ear < (earThreshold - 0.05)) {
      alertnessLevel = 'Extremely Drowsy';
      warningMessage = 'EYES CLOSED! STOP DRIVING IMMEDIATELY!';
    } else if (avgBlink > drowsyThreshold || ear < earThreshold) {
      alertnessLevel = 'Drowsy';
      warningMessage = 'High drowsiness detected. Pull over safely.';
    } else if (headPoseStatus === 'Looking Down' || headPoseStatus !== 'Forward') {
      alertnessLevel = 'Slightly Drowsy';
      warningMessage = 'Attention drifting. Focus on the road.';
    }

    return { alertnessLevel, ear: parseFloat(ear.toFixed(3)), headPoseStatus, warningMessage };
  }
);

export async function realtimeDrowsinessAnalysis(input: RealtimeDrowsinessAnalysisInput): Promise<RealtimeDrowsinessAnalysisOutput> {
  return realtimeDrowsinessAnalysisFlow(input);
}
