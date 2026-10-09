import React, { useEffect, useRef } from 'react';

export function drawInkStamp(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  rawLabel: string,
  color: string = '#b91c1c'
) {
  const label = (rawLabel || 'BORRADOR').trim().toUpperCase();
  ctx.save();
  ctx.clearRect(0, 0, width, height);

  const seedStr = label + color;
  let h = 0x811c9dc5;
  for (let i = 0; i < seedStr.length; i++) {
    h ^= seedStr.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  const rand = () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };

  const margin = Math.max(2, height * 0.04);
  const outerW = width - margin * 2;
  const outerH = height - margin * 2;
  const outerX = margin;
  const outerY = margin;
  const outerRadius = Math.min(10, height * 0.14);
  const outerStroke = Math.max(2, height * 0.05);

  const inset = Math.max(3, height * 0.05);
  const innerX = outerX + inset;
  const innerY = outerY + inset;
  const innerW = outerW - inset * 2;
  const innerH = outerH - inset * 2;
  const innerRadius = Math.max(2, outerRadius - inset * 0.6);
  const innerStroke = Math.max(1, height * 0.02);

  ctx.fillStyle = color;
  ctx.globalAlpha = 0.04;
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(outerX, outerY, outerW, outerH, outerRadius);
  } else {
    ctx.rect(outerX, outerY, outerW, outerH);
  }
  ctx.fill();

  ctx.globalAlpha = 0.86;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;

  ctx.lineWidth = outerStroke;
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(outerX + outerStroke / 2, outerY + outerStroke / 2, outerW - outerStroke, outerH - outerStroke, outerRadius);
  } else {
    ctx.rect(outerX + outerStroke / 2, outerY + outerStroke / 2, outerW - outerStroke, outerH - outerStroke);
  }
  ctx.stroke();

  if (innerW > 10 && innerH > 10) {
    ctx.lineWidth = innerStroke;
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(innerX + innerStroke / 2, innerY + innerStroke / 2, innerW - innerStroke, innerH - innerStroke, innerRadius);
    } else {
      ctx.rect(innerX + innerStroke / 2, innerY + innerStroke / 2, innerW - innerStroke, innerH - innerStroke);
    }
    ctx.stroke();
  }

  const availW = Math.max(20, innerW - innerStroke * 2 - 8);
  const availH = Math.max(10, innerH - innerStroke * 2 - 4);

  let fontSize = Math.max(8, Math.min(availH * 0.72, availW * 0.28));
  const fontFam = '900 ' + fontSize + 'px Impact, ' + String.fromCharCode(34) + 'Arial Black' + String.fromCharCode(34) + ', -apple-system, sans-serif';
  ctx.font = fontFam;

  const chars = Array.from(label);
  let tracking = Math.max(1, fontSize * 0.16);

  let textWidth = 0;
  for (const ch of chars) {
    textWidth += ctx.measureText(ch).width;
  }
  textWidth += (chars.length - 1) * tracking;

  if (textWidth > availW && textWidth > 0) {
    const scale = availW / textWidth;
    fontSize = Math.max(7, Math.floor(fontSize * scale));
    tracking = Math.max(0.5, fontSize * 0.16);
    ctx.font = '900 ' + fontSize + 'px Impact, ' + String.fromCharCode(34) + 'Arial Black' + String.fromCharCode(34) + ', -apple-system, sans-serif';
    textWidth = 0;
    for (const ch of chars) {
      textWidth += ctx.measureText(ch).width;
    }
    textWidth += (chars.length - 1) * tracking;
  }

  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  const startX = width / 2 - textWidth / 2;
  const centerY = height / 2;

  let curX = startX;
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    const chW = ctx.measureText(ch).width;
    const jitterY = (rand() - 0.5) * Math.min(1, fontSize * 0.03);
    ctx.fillText(ch, curX, centerY + jitterY);
    curX += chW + tracking;
  }

  const numVoids = Math.min(45, Math.max(12, Math.round((width * height) / 350)));
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  for (let i = 0; i < numVoids; i++) {
    const rx = outerX + rand() * outerW;
    const ry = outerY + rand() * outerH;
    const rRadius = 0.5 + rand() * Math.max(1, height * 0.02);
    ctx.globalAlpha = 0.15 + rand() * 0.45;
    ctx.beginPath();
    ctx.arc(rx, ry, rRadius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  ctx.fillStyle = color;
  const numBleed = Math.min(30, Math.max(8, Math.round(width / 15)));
  for (let i = 0; i < numBleed; i++) {
    const isTopBottom = rand() > 0.5;
    const bx = isTopBottom ? outerX + rand() * outerW : (rand() > 0.5 ? outerX : outerX + outerW) + (rand() - 0.5) * outerStroke;
    const by = isTopBottom ? (rand() > 0.5 ? outerY : outerY + outerH) + (rand() - 0.5) * outerStroke : outerY + rand() * outerH;
    const bRadius = 0.4 + rand() * Math.max(0.8, outerStroke * 0.35);
    ctx.globalAlpha = 0.25 + rand() * 0.4;
    ctx.beginPath();
    ctx.arc(bx, by, bRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

export const StampCanvas: React.FC<{
  label: string;
  color: string;
  width: number;
  height: number;
  className?: string;
}> = ({ label, color, width, height, className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || width <= 0 || height <= 0) return;

    const dpr = typeof window !== 'undefined' ? Math.max(1, window.devicePixelRatio || 1) : 1;
    const pxW = Math.round(width * dpr);
    const pxH = Math.round(height * dpr);

    canvas.width = pxW;
    canvas.height = pxH;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.scale(dpr, dpr);
    drawInkStamp(ctx, width, height, label, color);
    ctx.restore();
  }, [label, color, width, height]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: width + 'px',
        height: height + 'px',
        display: 'block',
        pointerEvents: 'none',
      }}
      className={'select-none ' + className}
    />
  );
};