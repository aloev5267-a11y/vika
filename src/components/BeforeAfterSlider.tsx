import { useRef, useState, useCallback } from 'react';

interface Props {
  imageBefore: string;
  imageAfter: string;
  alt?: string;
  className?: string;
}

/**
 * Интерактивное сравнение "до/после" с перетаскиваемым разделителем.
 * Поддерживает мышь, касания и клавиатуру (стрелки).
 */
export default function BeforeAfterSlider({ imageBefore, imageAfter, alt = 'Результат до и после', className = '' }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(50); // процент видимой части "после"
  const dragging = useRef(false);

  const updateFromClientX = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.min(100, Math.max(0, pct)));
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    updateFromClientX(e.clientX);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    updateFromClientX(e.clientX);
  };
  const onPointerUp = () => {
    dragging.current = false;
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') setPos((p) => Math.max(0, p - 4));
    if (e.key === 'ArrowRight') setPos((p) => Math.min(100, p + 4));
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden select-none touch-none ${className}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      {/* Слой "До" (низ) */}
      <img src={imageBefore || '/placeholder.svg'} alt={`${alt} — до`} className="absolute inset-0 w-full h-full object-cover" draggable={false} crossOrigin="anonymous" decoding="async" />
      {/* Метка "До" */}
      <span className="absolute bottom-3 right-3 text-[11px] font-semibold px-2 py-1 rounded-full bg-black/60 text-white backdrop-blur-sm">До</span>

      {/* Слой "После" (верх), обрезается по позиции */}
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
        <img
          src={imageAfter || '/placeholder.svg'}
          alt={`${alt} — после`}
          className="absolute inset-0 h-full object-cover max-w-none"
          style={{ width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%' }}
          draggable={false}
          crossOrigin="anonymous"
          decoding="async"
        />
        <span className="absolute bottom-3 left-3 text-[11px] font-semibold px-2 py-1 rounded-full bg-pink-400 text-black">После</span>
      </div>

      {/* Разделитель */}
      <div className="absolute top-0 bottom-0 -ml-px w-0.5 bg-white shadow-[0_0_8px_rgba(0,0,0,0.4)]" style={{ left: `${pos}%` }}>
        <button
          type="button"
          aria-label="Перетащите, чтобы сравнить до и после"
          onKeyDown={onKeyDown}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white text-slate-900 shadow-lg flex items-center justify-center cursor-ew-resize"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M9 7l-5 5 5 5M15 7l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
