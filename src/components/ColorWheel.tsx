import { useRef } from 'react';
import type { PointerEvent } from 'react';
import { hsvToHex, hsvToWheelPoint, wheelPointToHsv, type HsvColor } from '@/lib/color';

interface ColorWheelProps {
  color: HsvColor;
  onChange: (color: HsvColor) => void;
}

export function ColorWheel({ color, onChange }: ColorWheelProps) {
  const wheelRef = useRef<HTMLDivElement>(null);

  const updateColor = (event: PointerEvent<HTMLDivElement>) => {
    const rect = wheelRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    const radius = rect.width / 2;
    onChange(wheelPointToHsv(x, y, radius, color.v));
  };

  const marker = hsvToWheelPoint(color, 1);

  return (
    <div
      ref={wheelRef}
      role="slider"
      aria-label="Цветовой круг"
      aria-valuetext={hsvToHex(color)}
      tabIndex={0}
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        updateColor(event);
      }}
      onPointerMove={(event) => event.currentTarget.hasPointerCapture(event.pointerId) && updateColor(event)}
      className="color-wheel relative aspect-square w-full max-w-[164px] touch-none rounded-full shadow-[0_10px_24px_rgba(0,0,0,0.32)] outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-white/80"
      style={{
        background: 'radial-gradient(circle, white 0%, rgba(255,255,255,0) 72%), conic-gradient(from 90deg, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)',
      }}
    >
      <span
        className="pointer-events-none absolute size-[15%] -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white shadow-[0_2px_8px_rgba(0,0,0,0.55)]"
        style={{
          background: hsvToHex(color),
          left: `${50 + marker.x * 43.9}%`,
          top: `${50 + marker.y * 43.9}%`,
        }}
      />
    </div>
  );
}
