import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent, WheelEvent as ReactWheelEvent } from 'react';
import { Check, FlipHorizontal, X } from 'lucide-react';

interface AvatarCropperProps {
  imageSrc: string;
  onCancel: () => void;
  onSave: (dataUrl: string) => void;
}

const MIN_STAGE_SIZE = 220;
const MAX_STAGE_SIZE = 480;
const STAGE_MARGIN = 24;
// Зум выше "чистого cover" (1×) даёт запас на панорамирование сразу в обе стороны —
// на 1× более узкое измерение фото ровно равно размеру рамки и двигаться некуда.
const MIN_ZOOM = 1;
const DEFAULT_ZOOM = 1.2;
const MAX_ZOOM = 4;

function clamp(value: number, max: number) {
  return Math.min(max, Math.max(-max, value));
}

function pointerDistance(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/**
 * Круглый кроппер аватара: свободное панорамирование во все стороны, зум колесом мыши
 * или щипком двумя пальцами (отдельного слайдера нет — он не давал ощутимой реакции и
 * только занимал место), зеркальное отражение, сброс. Область управления зафиксирована
 * внизу и никогда не перекрывается фото — сцена кропа ограничена местом над ней.
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
  const activePointers = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchState = useRef<{ distance: number; zoom: number } | null>(null);
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;

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
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // На некоторых устройствах/синтетических событиях capture недоступен —
      // не критично, продолжаем без него (move/up всё равно долетят при обычном drag).
    }
    activePointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (activePointers.current.size === 2) {
      dragState.current = null;
      const [a, b] = [...activePointers.current.values()];
      pinchState.current = { distance: pointerDistance(a, b), zoom: zoomRef.current };
    } else if (activePointers.current.size === 1) {
      pinchState.current = null;
      dragState.current = { startX: event.clientX, startY: event.clientY, startOffsetX: offset.x, startOffsetY: offset.y };
    }
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!activePointers.current.has(event.pointerId)) return;
    activePointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (activePointers.current.size >= 2 && pinchState.current) {
      const [a, b] = [...activePointers.current.values()];
      const distance = pointerDistance(a, b);
      const nextZoom = clampZoom((pinchState.current.zoom * distance) / pinchState.current.distance);
      setZoom(nextZoom);
      return;
    }

    if (!dragState.current) return;
    const dx = event.clientX - dragState.current.startX;
    const dy = event.clientY - dragState.current.startY;
    setOffset({
      x: clamp(dragState.current.startOffsetX + dx, maxOffsetX),
      y: clamp(dragState.current.startOffsetY + dy, maxOffsetY),
    });
  };

  const endPointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    activePointers.current.delete(event.pointerId);
    if (activePointers.current.size < 2) pinchState.current = null;
    dragState.current = null;
  };

  function clampZoom(value: number) {
    return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));
  }

  const handleWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    setZoom((current) => clampZoom(current - event.deltaY * 0.0015));
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
          style={{ background: flipped ? '#6546C7' : 'rgba(255,255,255,0.15)' }}
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
          onPointerUp={endPointer}
          onPointerCancel={endPointer}
          onPointerLeave={endPointer}
          onWheel={handleWheel}
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
      <div className="shrink-0 bg-black px-5 pt-5 pb-6 z-10" style={{ boxShadow: '0 -8px 24px rgba(0,0,0,0.4)' }}>
        <div className="w-full max-w-xs mx-auto flex items-center justify-between">
          <button
            onClick={onCancel}
            aria-label="Отмена"
            className="flex flex-col items-center gap-1.5 w-16"
          >
            <span className="w-14 h-14 rounded-full flex items-center justify-center text-white" style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.15)' }}>
              <X size={24} />
            </span>
            <span className="text-white/80 text-xs font-body">Отмена</span>
          </button>

          <button onClick={handleReset} aria-label="Сброс" className="flex flex-col items-center gap-1.5">
            <span className="px-5 py-3 rounded-full text-white font-heading font-semibold text-sm" style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.15)' }}>
              Сброс
            </span>
          </button>

          <button
            onClick={handleSave}
            disabled={!naturalSize}
            aria-label="Сохранить"
            className="flex flex-col items-center gap-1.5 w-16 disabled:opacity-50"
          >
            <span className="w-14 h-14 rounded-full bg-sevchik-purple flex items-center justify-center text-white">
              <Check size={24} />
            </span>
            <span className="text-white/80 text-xs font-body">Сохранить</span>
          </button>
        </div>
      </div>
    </div>
  );
}
