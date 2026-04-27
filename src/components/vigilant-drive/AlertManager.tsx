
"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { AlertCircle, Volume2, VolumeX, BellRing } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface AlertManagerProps {
  alertnessLevel: 'Awake' | 'Slightly Drowsy' | 'Drowsy' | 'Extremely Drowsy';
  warningMessage: string | null;
  isEnabled: boolean;
}

export const AlertManager: React.FC<AlertManagerProps> = ({
  alertnessLevel,
  warningMessage,
  isEnabled,
}) => {
  const [muted, setMuted] = useState(false);
  const audioCtx = useRef<AudioContext | null>(null);
  const oscillator = useRef<OscillatorNode | null>(null);
  const gainNode = useRef<GainNode | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Web Audio API
  const initAudio = useCallback(() => {
    if (!audioCtx.current) {
      audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      gainNode.current = audioCtx.current.createGain();
      gainNode.current.connect(audioCtx.current.destination);
    }
    if (audioCtx.current.state === 'suspended') {
      audioCtx.current.resume();
    }
  }, []);

  const stopSound = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (oscillator.current) {
      try {
        oscillator.current.stop();
        oscillator.current.disconnect();
      } catch (e) {}
      oscillator.current = null;
    }
  }, []);

  const playSiren = useCallback((intensity: 'high' | 'critical') => {
    stopSound();
    initAudio();

    if (!audioCtx.current || !gainNode.current) return;

    const ctx = audioCtx.current;
    const gain = gainNode.current;

    // Siren Logic: Oscillating piercing frequencies
    const pulse = () => {
      const osc = ctx.createOscillator();
      const localGain = ctx.createGain();
      
      osc.type = 'sawtooth'; // Piercing harmonics
      osc.frequency.setValueAtTime(intensity === 'critical' ? 880 : 440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(intensity === 'critical' ? 1760 : 880, ctx.currentTime + 0.1);
      
      osc.connect(localGain);
      localGain.connect(gain);
      
      localGain.gain.setValueAtTime(0, ctx.currentTime);
      localGain.gain.linearRampToValueAtTime(1.0, ctx.currentTime + 0.05); // MAX VOLUME
      localGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    };

    pulse();
    intervalRef.current = setInterval(pulse, intensity === 'critical' ? 200 : 500);
  }, [initAudio, stopSound]);

  useEffect(() => {
    if (!isEnabled || muted) {
      stopSound();
      return;
    }

    if (alertnessLevel === 'Extremely Drowsy') {
      playSiren('critical');
    } else if (alertnessLevel === 'Drowsy') {
      playSiren('high');
    } else {
      stopSound();
    }

    return () => stopSound();
  }, [alertnessLevel, isEnabled, muted, playSiren, stopSound]);

  const getAlertColor = () => {
    switch (alertnessLevel) {
      case 'Extremely Drowsy': return 'bg-destructive text-destructive-foreground';
      case 'Drowsy': return 'bg-orange-600 text-white';
      case 'Slightly Drowsy': return 'bg-yellow-500 text-white';
      default: return 'bg-primary text-primary-foreground';
    }
  };

  if (!isEnabled && alertnessLevel === 'Awake') return null;

  return (
    <>
      {/* Full Screen Visual Alert for Critical Drowsiness */}
      {alertnessLevel === 'Extremely Drowsy' && isEnabled && (
        <div className="fixed inset-0 z-[100] pointer-events-none border-[20px] border-destructive animate-pulse bg-destructive/20" />
      )}

      <div className="fixed bottom-6 right-6 z-[110] flex flex-col gap-4">
        {(warningMessage && (alertnessLevel !== 'Awake' || warningMessage === 'Face not detected')) && (
          <Card className={cn("w-80 shadow-2xl border-none animate-in slide-in-from-right-full duration-300", getAlertColor(), alertnessLevel === 'Extremely Drowsy' && "alert-pulse")}>
            <CardContent className="p-4 flex items-center gap-3">
              <AlertCircle className={cn("h-8 w-8 shrink-0", alertnessLevel === 'Extremely Drowsy' && "animate-bounce")} />
              <div className="flex-1">
                <p className="font-black text-xs uppercase tracking-widest mb-1">{alertnessLevel}</p>
                <p className="text-sm font-bold leading-tight">{warningMessage}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-2 self-end">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full bg-white shadow-lg h-10 px-4 font-bold text-xs"
            onClick={() => {
              initAudio();
              playSiren('high');
              setTimeout(stopSound, 1000);
            }}
          >
            <BellRing className="h-4 w-4 mr-2" /> TEST ALARM
          </Button>
          
          {(alertnessLevel.includes('Drowsy')) && (
            <Button
              variant="secondary"
              size="icon"
              className="rounded-full shadow-lg h-14 w-14 hover:scale-110 transition-transform bg-white"
              onClick={() => setMuted(!muted)}
            >
              {muted ? <VolumeX className="h-6 w-6 text-destructive" /> : <Volume2 className="h-6 w-6 text-primary" />}
            </Button>
          )}
        </div>
      </div>
    </>
  );
};
