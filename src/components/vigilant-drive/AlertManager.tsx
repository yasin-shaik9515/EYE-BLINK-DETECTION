"use client";

import React, { useEffect, useRef } from 'react';
import { AlertCircle, Volume2, VolumeX } from 'lucide-react';
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
  const [muted, setMuted] = React.useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Use an aggressive, continuous alarm sound for extreme drowsiness
    const alarmSound = 'https://actions.google.com/sounds/v1/alarms/emergency_it_is_done.ogg';
    audioRef.current = new Audio(alarmSound);
    audioRef.current.loop = true;
    
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  useEffect(() => {
    if (!isEnabled || muted || !audioRef.current) {
      audioRef.current?.pause();
      return;
    }

    // Play continuously if Drowsy or Extremely Drowsy
    if (alertnessLevel === 'Drowsy' || alertnessLevel === 'Extremely Drowsy') {
      // Faster playback for extreme drowsiness to increase urgency
      audioRef.current.playbackRate = alertnessLevel === 'Extremely Drowsy' ? 1.5 : 1.0;
      audioRef.current.play().catch(e => console.warn("Audio play failed:", e));
    } else {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [alertnessLevel, isEnabled, muted]);

  if (!isEnabled && alertnessLevel === 'Awake') return null;

  const getAlertColor = () => {
    switch (alertnessLevel) {
      case 'Extremely Drowsy': return 'bg-destructive text-destructive-foreground';
      case 'Drowsy': return 'bg-orange-600 text-white';
      case 'Slightly Drowsy': return 'bg-yellow-500 text-white';
      default: return 'bg-primary text-primary-foreground';
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-4">
      {(warningMessage && (alertnessLevel !== 'Awake' || warningMessage === 'Face not detected')) && (
        <Card className={cn("w-80 shadow-2xl border-none animate-in slide-in-from-right-full duration-300", getAlertColor(), alertnessLevel === 'Extremely Drowsy' && "alert-pulse")}>
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className={cn("h-8 w-8 shrink-0", alertnessLevel === 'Extremely Drowsy' && "animate-bounce")} />
            <div>
              <p className="font-black text-xs uppercase tracking-widest mb-1">{alertnessLevel}</p>
              <p className="text-sm font-medium leading-tight">{warningMessage}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {(alertnessLevel.includes('Drowsy')) && (
        <Button
          variant="secondary"
          size="icon"
          className="rounded-full shadow-lg self-end h-14 w-14 hover:scale-110 transition-transform"
          onClick={() => setMuted(!muted)}
        >
          {muted ? <VolumeX className="h-6 w-6 text-destructive" /> : <Volume2 className="h-6 w-6 text-primary" />}
        </Button>
      )}
    </div>
  );
};
