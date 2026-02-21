import React, { useEffect, useRef } from 'react';
import { SimulationMode, SimulationState, ForceData } from '../types';
import { COLORS, SCALES } from '../constants';

interface Props {
  state: SimulationState;
  forceData: ForceData;
}

const SimulationCanvas: React.FC<Props> = ({ state, forceData }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawArrow = (
    ctx: CanvasRenderingContext2D,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    color: string,
    label: string,
    isDashed = false
  ) => {
    const headLength = 10;
    const dx = toX - fromX;
    const dy = toY - fromY;
    const angle = Math.atan2(dy, dx);

    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 3;
    if (isDashed) ctx.setLineDash([5, 5]);

    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    // Arrow head
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();

    // Label
    ctx.font = 'bold 14px Cairo';
    ctx.textAlign = 'center';
    const midX = toX + 15 * Math.cos(angle);
    const midY = toY + 15 * Math.sin(angle);
    ctx.fillText(label, midX, midY);
    ctx.restore();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      const objSize = SCALES.objectSize;

      if (state.mode === SimulationMode.SUSPENDED) {
        // Draw Ceiling
        ctx.fillStyle = '#444';
        ctx.fillRect(centerX - 50, 20, 100, 10);

        // Draw Rope
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX, 30);
        ctx.lineTo(centerX, centerY - objSize / 2);
        ctx.stroke();

        // Draw Object
        ctx.fillStyle = COLORS.object;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.fillRect(centerX - objSize / 2, centerY - objSize / 2, objSize, objSize);
        ctx.strokeRect(centerX - objSize / 2, centerY - objSize / 2, objSize, objSize);

        // Draw Forces
        const fgLen = forceData.fg * SCALES.forceToPixels;
        const ftLen = forceData.ft * SCALES.forceToPixels;

        drawArrow(ctx, centerX, centerY, centerX, centerY + fgLen, COLORS.fg, `Fg = ${forceData.fg.toFixed(1)}N`);
        drawArrow(ctx, centerX, centerY, centerX, centerY - ftLen, COLORS.ft, `FT = ${forceData.ft.toFixed(1)}N`);

      } else {
        // Mode: PULLED
        const groundY = centerY + objSize / 2;
        const objY = forceData.isFloating ? centerY - 20 : centerY;
        const currentGroundY = objY + objSize / 2;

        // Draw Ground
        ctx.fillStyle = COLORS.surface;
        ctx.fillRect(50, groundY + 2, width - 100, 4);

        // Draw Object
        ctx.fillStyle = COLORS.object;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.fillRect(centerX - objSize / 2, objY - objSize / 2, objSize, objSize);
        ctx.strokeRect(centerX - objSize / 2, objY - objSize / 2, objSize, objSize);

        // Forces
        const fgLen = forceData.fg * SCALES.forceToPixels;
        const fnLen = forceData.fn * SCALES.forceToPixels;
        const ftLen = forceData.ft * SCALES.forceToPixels;
        
        const rad = (state.angle * Math.PI) / 180;
        const ftX = centerX + ftLen * Math.cos(rad);
        const ftY = objY - ftLen * Math.sin(rad);

        // Fg
        drawArrow(ctx, centerX, objY, centerX, objY + fgLen, COLORS.fg, `Fg = ${forceData.fg.toFixed(1)}N`);
        
        // FN
        if (forceData.fn > 0) {
          drawArrow(ctx, centerX, currentGroundY, centerX, currentGroundY - fnLen, COLORS.fn, `FN = ${forceData.fn.toFixed(1)}N`);
        }

        // FT
        drawArrow(ctx, centerX, objY, ftX, ftY, COLORS.ft, `FT = ${forceData.ft.toFixed(1)}N`);

        // Components
        if (state.angle > 0 && state.angle < 90) {
          const ftxLen = forceData.ftx * SCALES.forceToPixels;
          const ftyLen = forceData.fty * SCALES.forceToPixels;
          drawArrow(ctx, centerX, objY, centerX + ftxLen, objY, COLORS.components, `FTx`, true);
          drawArrow(ctx, centerX + ftxLen, objY, centerX + ftxLen, objY - ftyLen, COLORS.components, `FTy`, true);
        }
      }
    };

    render();
  }, [state, forceData]);

  return (
    <div className="w-full h-full flex items-center justify-center bg-white rounded-2xl shadow-inner overflow-hidden border border-slate-200">
      <canvas
        ref={canvasRef}
        width={600}
        height={400}
        className="max-w-full h-auto"
      />
    </div>
  );
};

export default SimulationCanvas;
