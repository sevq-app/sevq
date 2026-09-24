import { useEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';

interface AvatarCropperProps {
  imageSrc: string;
  onCancel: () => void;
  onSave: (dataUrl: string) => void;
}

const STAGE_SIZE = 280;
const OUTPUT_SIZE = 400;
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;

function clamp(value: number, max: number) {
  return Math.min(max, Math.max(-max, value));
}

/** Круглый кроппер аватара: перетаскивание мышью/пальцем + зум ползунком, сохранение через canvas. */
export function AvatarCropper({ imageSrc, onCancel, onSave }: AvatarCropperProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragState = useRef<{ startX: number; startY: number; startOffsetX: number; startOffsetY: number } | null>(null);

  const baseScale = naturalSize ? STAGE_SIZE / Math.min(naturalSize.w, naturalSize.h) : 1;
  const totalScale = baseScale * zoom;
  const scaledW = naturalSize ? naturalSize.w * totalScale : STAGE_SIZE;
  const scaledH = naturalSize ? naturalSize.h * totalScale : STAGE_SIZE;
  const maxOffsetX = Math.max(0, (scaledW - STAGE_SIZE) / 2);
  const maxOffsetY = Math.max(0, (scaledH - STAGE_SIZE) / 2);

  useEffect(() => {
    setOffset((current) => ({ x: clamp(current.x, maxOffsetX), y: clamp(current.y, maxOffsetY) }));
    // maxOffsetX/Y derived from zoom + naturalSize, re-clamp whenever either changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom, naturalSize]);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragState.current = { startX: event.clientX, startY: event.clientY, startOffsetX: offset.x, startOffsetY: offset.y };
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragState.current) return;
    const dx = event.clientX - dragState.current.startX;
    const dy = event.clientY - dragState.current.startY;
    setOffset({
      x: clamp(dragState.current.startOffsetX + dx, maxOffsetX),
      y: clamp(dragState.current.startOffsetY + dy, maxOffsetY),
    });
  };

  const handlePointerUp = () => {
    dragState.current = null;
  };

  const handleSave = () => {
    if (!naturalSize || !imgRef.current) return;
    const sx = (scaledW - STAGE_SIZE) / 2 - offset.x;
    const sy = (scaledH - STAGE_SIZE) / 2 - offset.y;
    const srcSize = STAGE_SIZE / totalScale;
    const srcX = Math.min(Math.max(sx / totalScale, 0), Math.max(0, naturalSize.w - srcSize));
    const srcY = Math.min(Math.max(sy / totalScale, 0), Math.max(0, naturalSize.h - srcSize));

    const canvas = document.createElement('canvas');
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(imgRef.current, srcX, srcY, srcSize, srcSize, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
    onSave(canvas.toDataURL('image/jpeg', 0.92));
  };

  return (
    <div
      className="fixed inset-0 z-[70] bg-black/90 flex flex-col items-center justify-center p-5"
    >
      <h2 className="text-white font-heading font-bold text-lg mb-5">Обрежьте фото</h2>

      <div
        className="relative touch-none select-none"
        style={{ width: STAGE_SIZE, height: STAGE_SIZE, cursor: 'grab' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <img
          ref={imgRef}
          src={imageSrc}
          alt="Обрезка фото"
          draggable={false}
          onLoad={(event) => {
            const target = event.currentTarget;
            setNaturalSize({ w: target.naturalWidth, h: target.naturalHeight });
          }}
          className="absolute pointer-events-none"
          style={{
            left: '50%',
            top: '50%',
            width: naturalSize ? scaledW : STAGE_SIZE,
            height: naturalSize ? scaledH : STAGE_SIZE,
            maxWidth: 'none',
            transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px)`,
          }}
        />
        {/* Тёмная маска с круглым "окном" — показывает, что попадёт в аватар */}
        <div className="absolute inset-0 rounded-full pointer-events-none" style={{ boxShadow: '0 0 0 9999px rgba(0,0,0,0.72)' }} />
        <div className="absolute inset-0 rounded-full pointer-events-none" style={{ boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.85)' }} />
      </div>

      <div className="w-full max-w-xs mt-8 flex items-center gap-3">
        <span className="text-white/70 text-xs select-none">−</span>
        <input
          type="range"
          min={MIN_ZOOM}
          max={MAX_ZOOM}
          step={0.01}
          value={zoom}
          onChange={(event) => setZoom(Number(event.target.value))}
          className="flex-1 accent-[#6546C7]"
          aria-label="Масштаб"
        />
        <span className="text-white/70 text-sm select-none">+</span>
      </div>

      <div className="flex gap-3 mt-8 w-full max-w-xs">
        <button onClick={onCancel} className="flex-1 rounded-xl bg-white/10 text-white py-3 font-heading font-bold">Отмена</button>
        <button onClick={handleSave} disabled={!naturalSize} className="flex-1 rounded-xl bg-sevchik-purple text-white py-3 font-heading font-bold disabled:opacity-50">Сохранить</button>
      </div>
    </div>
  );
}
