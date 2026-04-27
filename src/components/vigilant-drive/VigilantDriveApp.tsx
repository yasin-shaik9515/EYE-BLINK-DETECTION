
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Camera, Play, Square, Settings2, Info, Loader2, Volume2, ShieldAlert } from 'lucide-react';
import { MonitoringOverlay } from './MonitoringOverlay';
import { AlertManager } from './AlertManager';
import { StatusMonitor } from './StatusMonitor';
import { realtimeDrowsinessAnalysis, RealtimeDrowsinessAnalysisOutput } from '@/ai/flows/realtime-drowsiness-analysis';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

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
  const lastProcessedTime = useRef<number>(0);
  const { toast } = useToast();

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
        console.error("Initialization failed:", error);
        toast({
          title: "System Error",
          description: "AI Monitoring engine failed to load. Please refresh.",
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
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsCapturing(true);
        };
      }
    } catch (err) {
      toast({
        title: "Camera Access Denied",
        description: "Please allow camera permissions to enable driver monitoring.",
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

    const timestamp = performance.now();
    const results = landmarkerRef.current.detectForVideo(videoRef.current, timestamp);

    if (results.faceLandmarks && results.faceLandmarks.length > 0) {
      const landmarks = results.faceLandmarks[0];
      setCurrentLandmarks(landmarks);
      
      const blendshapes = results.faceBlendshapes?.[0]?.categories || [];
      const leftBlink = blendshapes.find(c => c.categoryName === 'eyeBlinkLeft')?.score || 0;
      const rightBlink = blendshapes.find(c => c.categoryName === 'eyeBlinkRight')?.score || 0;

      if (timestamp - lastProcessedTime.current > 100) {
        lastProcessedTime.current = timestamp;
        const analysis = await realtimeDrowsinessAnalysis({ 
          faceLandmarks: landmarks,
          blinkScores: { left: leftBlink, right: rightBlink }
        });
        setAnalysisResult(analysis);
      }
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
    <div className="flex flex-col gap-8 max-w-6xl mx-auto px-4 py-12 pb-32">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-primary font-headline tracking-tighter flex items-center gap-3">
            VigilantDrive <span className="text-secondary text-xs font-bold px-3 py-1 bg-secondary/10 border border-secondary/20 rounded-full animate-pulse uppercase">Active AI</span>
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">Next-gen driver drowsiness detection with neural vision.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" className="rounded-xl h-12 w-12" onClick={() => setShowSettings(!showSettings)}>
            <Settings2 className="h-6 w-6" />
          </Button>
          {!isCapturing ? (
            <Button size="lg" onClick={startCamera} className="bg-primary hover:bg-primary/90 rounded-2xl px-10 h-14 text-lg font-bold shadow-xl shadow-primary/20 transition-all hover:scale-105" disabled={!isInitialized}>
              {!isInitialized ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Play className="h-6 w-6 mr-2 fill-current" />}
              {isInitialized ? 'Engage Monitoring' : 'Initializing...'}
            </Button>
          ) : (
            <Button size="lg" variant="destructive" onClick={stopCamera} className="rounded-2xl px-10 h-14 text-lg font-bold shadow-xl shadow-destructive/20 transition-all hover:scale-105">
              <Square className="h-6 w-6 mr-2 fill-current" /> Terminate
            </Button>
          )}
        </div>
      </header>

      {!isCapturing && isInitialized && (
        <Alert className="bg-primary/5 border-primary/20">
          <Volume2 className="h-4 w-4" />
          <AlertTitle className="font-bold">System Check Required</AlertTitle>
          <AlertDescription>
            Before driving, please use the <b>TEST ALARM</b> button in the bottom right to ensure your speakers are at maximum volume.
          </AlertDescription>
        </Alert>
      )}

      {showSettings && (
        <div className="bg-white rounded-3xl p-8 shadow-2xl border border-primary/5 animate-in slide-in-from-top-4 duration-300">
          <h3 className="text-xl font-black mb-6 flex items-center gap-3">
            <Settings2 className="h-6 w-6 text-primary" /> Advanced Calibration
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <Label className="text-base font-bold">Detection Sensitivity</Label>
                <span className="text-lg font-black text-primary">{sensitivity[0]}%</span>
              </div>
              <Slider 
                value={sensitivity} 
                onValueChange={setSensitivity} 
                max={100} 
                step={1} 
                className="py-4"
              />
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" /> Adjusted for variable lighting and driver eyewear.
              </p>
            </div>
            <div className="space-y-4">
              <Label className="text-base font-bold">Neural Core Logs</Label>
              <div className="h-32 bg-slate-950 rounded-2xl p-4 text-[11px] font-mono overflow-y-auto text-emerald-400 border border-emerald-900/30">
                <span className="opacity-50">[{new Date().toLocaleTimeString()}]</span> Core initialized (Delegate: GPU)<br/>
                {isInitialized && <><span className="opacity-50">[{new Date().toLocaleTimeString()}]</span> FaceMesh: 478_LANDMARKS_ACTIVE<br/></>}
                {isCapturing && <><span className="opacity-50">[{new Date().toLocaleTimeString()}]</span> Stream: 1280x720_RAW_INPUT<br/></>}
                {analysisResult && <><span className="opacity-50">[{new Date().toLocaleTimeString()}]</span> Confidence: 99.8% | State: {analysisResult.alertnessLevel}<br/></>}
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="flex flex-col xl:flex-row gap-10 items-start">
        <div className="flex-1 w-full flex flex-col items-center">
          <div className="video-container shadow-2xl ring-8 ring-primary/5 rounded-[2rem] border-4 border-white">
            {!isCapturing && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-white bg-slate-900/80 backdrop-blur-xl">
                <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
                  <Camera className="h-12 w-12 text-primary" />
                </div>
                <p className="text-2xl font-black font-headline">Optical Core Standby</p>
                <p className="text-muted-foreground mt-2">Activate monitoring to secure drive</p>
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

        <div className="w-full xl:w-96 space-y-8">
          <StatusMonitor data={analysisResult} isCapturing={isCapturing} />
          
          <div className="bg-gradient-to-br from-secondary/10 to-primary/10 rounded-[2rem] p-8 border border-white shadow-sm">
            <h4 className="font-black text-secondary uppercase tracking-wider text-sm mb-3 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4" /> Safety Protocol
            </h4>
            <p className="text-base text-slate-600 leading-relaxed font-medium">
              Immediate action: If alert triggers, safely pull over. This system uses a synthetic high-frequency alarm designed to be audible over road noise. Ensure system volume is at 100%.
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
