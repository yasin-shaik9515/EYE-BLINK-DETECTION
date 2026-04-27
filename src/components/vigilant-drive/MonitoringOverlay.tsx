"use client";

import React, { useEffect, useRef } from 'react';

interface MonitoringOverlayProps {
  landmarks: any[] | null;
  isActive: boolean;
}

export const MonitoringOverlay: React.FC<MonitoringOverlayProps> = ({ landmarks, isActive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!isActive || !landmarks || landmarks.length === 0) return;

    // Draw landmark dots
    ctx.fillStyle = '#10B395';
    landmarks.forEach((landmark) => {
      const x = landmark.x * canvas.width;
      const y = landmark.y * canvas.height;
      ctx.beginPath();
      ctx.arc(x, y, 1, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Draw eye connections for EAR visualization (optional but professional)
    const drawConnection = (indices: number[]) => {
      ctx.strokeStyle = '#2694D9';
      ctx.lineWidth = 1;
      ctx.beginPath();
      const start = landmarks[indices[0]];
      ctx.moveTo(start.x * canvas.width, start.y * canvas.height);
      indices.forEach(idx => {
        const p = landmarks[idx];
        ctx.lineTo(p.x * canvas.width, p.y * canvas.height);
      });
      ctx.closePath();
      ctx.stroke();
    };

    // MediaPipe approximate eye indices
    const leftEye = [33, 160, 158, 133, 153, 144];
    const rightEye = [362, 385, 387, 263, 373, 380];
    drawConnection(leftEye);
    drawConnection(rightEye);

  }, [landmarks, isActive]);

  return (
    <canvas
      ref={canvasRef}
      className="canvas-overlay"
      width={800}
      height={600}
    />
  );
};
