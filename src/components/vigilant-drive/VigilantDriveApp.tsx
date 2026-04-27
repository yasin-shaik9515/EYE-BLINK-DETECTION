"use client";

import React, { useState, useRef, useEffect } from 'react';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Camera, Play, Square, Settings2, Info } from 'lucide-react';
import { MonitoringOverlay } from './MonitoringOverlay';
import { AlertManager } from './AlertManager';
import { StatusMonitor } from './StatusMonitor';
import { realtimeDrowsinessAnalysis, RealtimeDrowsinessAnalysisOutput } from '@/ai/flows/realtime-drowsiness-analysis';
import { useToast } from '@/hooks/use-toast';

const MODEL_URL = "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";

export default function VigilantDriveApp() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<RealtimeDrowsinessAnalysisOutput | null>(null);
  const [sensitivity, setSensitivity] = useState([50]);
  const [showSettings, setShowSettings] = useState(false);
  const [currentLandmarks, setCurrentLandmarks] = useState<any[] | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const landmarkerRef = useRef<FaceLandmarker | null>(null);
  const requestRef = useRef<number>(null);
  const { toast } = useToast();

  // Initialization
  useEffect(() => {
    async function init() {
      try {
        const filesetResolver = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        landmarkerRef.current = await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: MODEL_URL,
            delegate: "GPU",
          },
          outputFaceBlendshapes: true,
          runningMode: "VIDEO",
          numFaces: 1,
        });
        setIsInitialized(true);
      } catch (error) {
        console.error("Failed to initialize FaceLandmarker:", error);
        toast({
          title: "System Error",
          description: "Could not load the AI monitoring model. Please check your internet connection.",
          variant: "destructive",
        });
      }
    }
    init();

    return () => {
      if (landmarkerRef.current) landmarkerRef.current.close();
    };
  }, [toast]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsCapturing(true);
        };
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      toast({
        title: "Camera Error",
        description: "Please grant camera permissions to use VigilantDrive.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach(track => track.stop());
    setIsCapturing(false);
    setAnalysisResult(null);
    setCurrentLandmarks(null);
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
  };

  const processFrame = async () => {
    if (!videoRef.current || !landmarkerRef.current || !isCapturing) return;

    const startTimeMs = performance.now();
    const results = landmarkerRef.current.detectForVideo(videoRef.current, startTimeMs);

    if (results.faceLandmarks && results.faceLandmarks.length > 0) {
      const landmarks = results.faceLandmarks[0];
      setCurrentLandmarks(landmarks);
      
      // Call analysis logic periodically (throtled to save processing)
      // For real-time smoothness, we calculate EAR locally or call the flow
      // We'll call the server flow to use the proprietary GenAI logic
      const analysis = await realtimeDrowsinessAnalysis({ faceLandmarks: landmarks });
      setAnalysisResult(analysis);
    } else {
      setCurrentLandmarks(null);
      setAnalysisResult(prev => prev ? { ...prev, alertnessLevel: 'Awake', warningMessage: 'Face not detected' } : null);
    }

    requestRef.current = requestAnimationFrame(processFrame);
  };

  useEffect(() => {
    if (isCapturing) {
      requestRef.current = requestAnimationFrame(processFrame);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isCapturing]);

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto px-4 py-8 pb-32">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-primary font-headline tracking-tight flex items-center gap-2">
            VigilantDrive <span className="text-secondary text-base font-medium px-2 py-0.5 bg-secondary/10 rounded-full">AI Active</span>
          </h1>
          <p className="text-muted-foreground mt-1">Next-generation driver drowsiness detection & safety monitor.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setShowSettings(!showSettings)}>
            <Settings2 className="h-5 w-5" />
          </Button>
          {!isCapturing ? (
            <Button size="lg" onClick={startCamera} className="bg-primary hover:bg-primary/90 rounded-full px-8 shadow-lg shadow-primary/20" disabled={!isInitialized}>
              <Play className="h-5 w-5 mr-2" /> Start Monitoring
            </Button>
          ) : (
            <Button size="lg" variant="destructive" onClick={stopCamera} className="rounded-full px-8 shadow-lg shadow-destructive/20">
              <Square className="h-5 w-5 mr-2" /> Stop System
            </Button>
          )}
        </div>
      </header>

      {showSettings && (
        <div className="bg-white rounded-2xl p-6 shadow-xl border border-primary/10 animate-in slide-in-from-top-4">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-primary" /> Configuration
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Detection Sensitivity</Label>
                <span className="text-sm font-bold text-primary">{sensitivity[0]}%</span>
              </div>
              <Slider 
                value={sensitivity} 
                onValueChange={setSensitivity} 
                max={100} 
                step={1} 
                className="py-4"
              />
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Info className="h-3 w-3" /> Higher sensitivity detects drowsiness earlier but may cause false alarms.
              </p>
            </div>
            <div className="space-y-4">
              <Label>System Logs</Label>
              <div className="h-24 bg-muted rounded-lg p-2 text-[10px] font-mono overflow-y-auto text-muted-foreground">
                {isInitialized ? '> AI Model Loaded\n' : '> Loading Model...\n'}
                {isCapturing ? '> Camera stream connected\n' : '> Stream disconnected\n'}
                {analysisResult && `> Alertness: ${analysisResult.alertnessLevel}\n`}
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="flex flex-col lg:flex-row gap-8 items-start">
        <div className="flex-1 w-full flex flex-col items-center">
          <div className="video-container shadow-2xl ring-4 ring-primary/5">
            {!isCapturing && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-white bg-slate-900/60 backdrop-blur-md">
                <Camera className="h-16 w-16 mb-4 opacity-50" />
                <p className="text-lg font-bold">System Ready</p>
                <p className="text-sm opacity-70">Click "Start Monitoring" to begin detection</p>
              </div>
            )}
            <video 
              ref={videoRef} 
              className="video-feed" 
              playsInline 
              muted 
            />
            <MonitoringOverlay landmarks={currentLandmarks} isActive={isCapturing} />
          </div>
        </div>

        <div className="w-full lg:w-80 space-y-6">
          <StatusMonitor data={analysisResult} isCapturing={isCapturing} />
          
          <div className="bg-secondary/5 rounded-2xl p-6 border border-secondary/20">
            <h4 className="font-bold text-secondary mb-2">Safety Tip</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              If you feel tired, the safest action is to pull over in a safe area and take a 20-minute power nap. VigilantDrive is an assistant tool, not a replacement for driver awareness.
            </p>
          </div>
        </div>
      </main>

      <AlertManager 
        alertnessLevel={analysisResult?.alertnessLevel || 'Awake'} 
        warningMessage={analysisResult?.warningMessage || null}
        isEnabled={isCapturing}
      />
    </div>
  );
}
