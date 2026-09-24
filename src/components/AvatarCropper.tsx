import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { Check, FlipHorizontal, X } from 'lucide-react';

interface AvatarCropperProps {
  imageSrc: string;
  onCancel: () => void;
  onSave: (dataUrl: string) => void;
}

const MIN_STAGE_SIZE = 160;
const MAX_STAGE_SIZE = 340;
const STAGE_MARGIN = 40;
// Зум выше "чистого cover" (1×) даёт запас на панорамирование сразу в обе стороны —
// на 1× более узкое измерение фото ровно равно размеру рамки и двигаться некуда.
const MIN_ZOOM = 1;
const DEFAULT_ZOOM = 1.2;
const MAX_ZOOM = 4;

function clamp(value: number, max: number) {
  return Math.min(max, Math.max(-max, value));
}

/**
 * Круглый кроппер аватара: свободное панорамирование во все стороны (pointer events),
 * зум ползунком, зеркальное отражение, сброс. Область управления зафиксирована внизу
 * и никогда не перекрывается фото — сцена кропа ограничена местом над ней.
 * Сохраняет выбранную область в исходном разрешении без даунскейла (PNG, без потерь).
 */
export function AvatarCropper({ imageSrc, onCancel, onSave }: AvatarCropperProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const stageAreaRef = useRef<HTMLDivElement>(null);
  const [stageSize, setStageSize] = useState(MAX_STAGE_SIZE);
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [flipped, setFlipped] = useState(false);
  const dragState = useRef<{ startX: number; startY: number; startOffsetX: number; startOffsetY: number } | null>(null);

  useLayoutEffect(() => {
    const el = stageAreaRef.current;
    if (!el) return;
    const measure = () => {
      const size = Math.min(el.clientWidth - STAGE_MARGIN, el.clientHeight - STAGE_MARGIN, MAX_STAGE_SIZE);
      setStageSize(Math.max(MIN_STAGE_SIZE, size));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const baseScale = naturalSize ? stageSize / Math.min(naturalSize.w, naturalSize.h) : 1;
  const totalScale = baseScale * zoom;
  const scaledW = naturalSize ? naturalSize.w * totalScale : stageSize;
  const scaledH = naturalSize ? naturalSize.h * totalScale : stageSize;
  const maxOffsetX = Math.max(0, (scaledW - stageSize) / 2);
  const maxOffsetY = Math.max(0, (scaledH - stageSize) / 2);

  useEffect(() => {
    setOffset((current) => ({ x: clamp(current.x, maxOffsetX), y: clamp(current.y, maxOffsetY) }));
    // maxOffsetX/Y derived from zoom + naturalSize + stageSize, re-clamp whenever any changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom, naturalSize, stageSize]);

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

  const handleReset = () => {
    setZoom(DEFAULT_ZOOM);
    setOffset({ x: 0, y: 0 });
    setFlipped(false);
  };

  const handleSave = () => {
    if (!naturalSize || !imgRef.current) return;
    const sx = (scaledW - stageSize) / 2 - offset.x;
    const sy = (scaledH - stageSize) / 2 - offset.y;
    const srcSize = stageSize / totalScale;
    const srcX = Math.min(Math.max(sx / totalScale, 0), Math.max(0, naturalSize.w - srcSize));
    const srcY = Math.min(Math.max(sy / totalScale, 0), Math.max(0, naturalSize.h - srcSize));
    // Полное исходное разрешение вырезанной области — без даунскейла до фиксированного размера.
    const outputSize = Math.round(srcSize);

    const canvas = document.createElement('canvas');
    canvas.width = outputSize;
    canvas.height = outputSize;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.save();
    if (flipped) {
      ctx.translate(outputSize, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(imgRef.current, srcX, srcY, srcSize, srcSize, 0, 0, outputSize, outputSize);
    ctx.restore();
    // PNG — без потерь, то же качество, что у сэмплированных пикселей оригинала.
    onSave(canvas.toDataURL('image/png'));
  };

  return (
    <div className="fixed inset-0 z-[70] bg-black flex flex-col">
      <div className="flex items-center justify-between px-5 pt-5 pb-2 shrink-0">
        <div className="w-11 h-11" />
        <h2 className="text-white font-heading font-bold text-base">Обрежьте фото</h2>
        <button
          onClick={() => setFlipped((value) => !value)}
          aria-label="Отразить"
          aria-pressed={flipped}
          className="w-11 h-11 rounded-full flex items-center justify-center text-white transition-colors"
          style={{ background: flipped ? '#6546C7' : 'rgba(255,255,255,0.1)' }}
        >
          <FlipHorizontal size={20} />
        </button>
      </div>

      <div ref={stageAreaRef} className="flex-1 min-h-0 flex items-center justify-center overflow-hidden px-5">
        <div
          className="relative touch-none select-none"
          style={{ width: stageSize, height: stageSize, cursor: 'grab' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          <div
            className="absolute pointer-events-none"
            style={{
              left: '50%',
              top: '50%',
              width: naturalSize ? scaledW : stageSize,
              height: naturalSize ? scaledH : stageSize,
              transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px)`,
            }}
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
              style={{
                width: '100%',
                height: '100%',
                maxWidth: 'none',
                transform: flipped ? 'scaleX(-1)' : 'none',
              }}
            />
          </div>
          {/* Тёмная маска с круглым "окном" — показывает, что попадёт в аватар */}
          <div className="absolute inset-0 rounded-full pointer-events-none" style={{ boxShadow: '0 0 0 9999px rgba(0,0,0,0.72)' }} />
          <div className="absolute inset-0 rounded-full pointer-events-none" style={{ boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.85)' }} />
        </div>
      </div>

      {/* Фиксированная нижняя панель — всегда на виду, фото двигается только над ней */}
      <div className="shrink-0 bg-black px-5 pt-4 pb-6" style={{ boxShadow: '0 -8px 24px rgba(0,0,0,0.4)' }}>
        <div className="w-full max-w-xs mx-auto flex items-center gap-3 mb-5">
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

        <div className="w-full max-w-xs mx-auto flex items-center justify-between">
          <button onClick={onCancel} aria-label="Отмена" className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-white">
            <X size={24} />
          </button>
          <button onClick={handleReset} aria-label="Сброс" className="px-5 py-3 rounded-full bg-white/10 text-white font-heading font-semibold text-sm">
            Сброс
          </button>
          <button
            onClick={handleSave}
            disabled={!naturalSize}
            aria-label="Подтвердить"
            className="w-14 h-14 rounded-full bg-sevchik-purple flex items-center justify-center text-white disabled:opacity-50"
          >
            <Check size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}
