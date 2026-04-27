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
    // Basic beep sound generator or static file
    // Using a base64 encoded simple beep sound
    const beep = "data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YV9vT18A";
    audioRef.current = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
    audioRef.current.loop = true;
  }, []);

  useEffect(() => {
    if (!isEnabled || muted || !audioRef.current) {
      audioRef.current?.pause();
      return;
    }

    if (alertnessLevel === 'Drowsy' || alertnessLevel === 'Extremely Drowsy') {
      audioRef.current.play().catch(e => console.warn("Audio play failed:", e));
    } else {
      audioRef.current.pause();
    }
  }, [alertnessLevel, isEnabled, muted]);

  if (!isEnabled && alertnessLevel === 'Awake') return null;

  const getAlertColor = () => {
    switch (alertnessLevel) {
      case 'Extremely Drowsy': return 'bg-destructive text-destructive-foreground';
      case 'Drowsy': return 'bg-orange-500 text-white';
      case 'Slightly Drowsy': return 'bg-yellow-500 text-white';
      default: return 'bg-primary text-primary-foreground';
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-4">
      {warningMessage && (
        <Card className={cn("w-80 shadow-2xl border-none animate-in slide-in-from-right-full", getAlertColor(), alertnessLevel.includes('Drowsy') && "alert-pulse")}>
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="h-6 w-6 shrink-0" />
            <div>
              <p className="font-bold text-sm uppercase tracking-wider">{alertnessLevel}</p>
              <p className="text-sm opacity-90">{warningMessage}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {(alertnessLevel === 'Drowsy' || alertnessLevel === 'Extremely Drowsy') && (
        <Button
          variant="secondary"
          size="icon"
          className="rounded-full shadow-lg self-end h-12 w-12"
          onClick={() => setMuted(!muted)}
        >
          {muted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
        </Button>
      )}
    </div>
  );
};
