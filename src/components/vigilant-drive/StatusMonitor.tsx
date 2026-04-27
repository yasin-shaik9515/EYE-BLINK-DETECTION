"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Activity, Eye, Compass, ShieldCheck } from 'lucide-react';
import { RealtimeDrowsinessAnalysisOutput } from '@/ai/flows/realtime-drowsiness-analysis';

interface StatusMonitorProps {
  data: RealtimeDrowsinessAnalysisOutput | null;
  isCapturing: boolean;
}

export const StatusMonitor: React.FC<StatusMonitorProps> = ({ data, isCapturing }) => {
  const earPercentage = data ? Math.min(100, Math.max(0, (data.ear / 0.4) * 100)) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      <Card className="bg-white/50 backdrop-blur-sm border-none shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Alertness Status</CardTitle>
          <Activity className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-headline">{data?.alertnessLevel || 'Waiting...'}</div>
          <p className="text-xs text-muted-foreground">
            {isCapturing ? 'System monitoring active' : 'Monitoring paused'}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-white/50 backdrop-blur-sm border-none shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Eye Aspect Ratio</CardTitle>
          <Eye className="h-4 w-4 text-secondary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-headline">{data?.ear.toFixed(3) || '0.000'}</div>
          <Progress value={earPercentage} className="h-2 mt-2" />
        </CardContent>
      </Card>

      <Card className="bg-white/50 backdrop-blur-sm border-none shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Head Pose</CardTitle>
          <Compass className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-headline">{data?.headPoseStatus || 'Unknown'}</div>
          <p className="text-xs text-muted-foreground">Alignment score: Optimal</p>
        </CardContent>
      </Card>

      <Card className="bg-white/50 backdrop-blur-sm border-none shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">System Health</CardTitle>
          <ShieldCheck className="h-4 w-4 text-secondary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-headline">Healthy</div>
          <p className="text-xs text-muted-foreground">VigilantDrive v1.0.4</p>
        </CardContent>
      </Card>
    </div>
  );
};
