import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { BeforeAfter } from '../lib/content';
import BeforeAfterSlider from './BeforeAfterSlider';

interface Props {
  items: BeforeAfter[];
  isDark: boolean;
}

/**
 * Галерея "до/после" для правой части hero.
 * Сверху — крупное интерактивное сравнение активной зоны,
 * снизу — горизонтальная лента превью для переключения между зонами.
 */
export default function HeroGallery({ items, isDark }: Props) {
  const [active, setActive] = useState(0);
  const visible = items.slice(0, 6);
  const current = visible[active];

  if (!current) return null;

  return (
    <div className="w-full max-w-md flex flex-col gap-3">
      {/* ОСНОВНОЕ СРАВНЕНИЕ */}
      <div className={`relative rounded-3xl overflow-hidden border h-[360px] md:h-[440px] ${isDark ? 'border-white/10' : 'border-black/10'}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0"
          >
            <BeforeAfterSlider
              imageBefore={current.imageBefore}
              imageAfter={current.imageAfter}
              alt={current.title}
              className="w-full h-full"
            />
            {current.title && (
              <div className="absolute top-3 left-3 text-xs font-semibold px-3 py-1.5 rounded-full bg-black/60 text-white backdrop-blur-sm pointer-events-none">
                {current.title}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* СИММЕТРИЧНАЯ СЕТКА ПРЕВЬЮ */}
      <div className="grid grid-cols-3 gap-2">
        {visible.map((item, idx) => {
          const isActive = idx === active;
          return (
            <button
              key={item.id}
              onClick={() => setActive(idx)}
              aria-label={`Показать: ${item.title || 'результат'}`}
              aria-pressed={isActive}
              className={`group relative aspect-square rounded-2xl overflow-hidden transition-all duration-300 ring-2 ${
                isActive
                  ? isDark
                    ? 'ring-pink-400 shadow-[0_0_16px_rgba(244,143,177,0.45)]'
                    : 'ring-purple-600 shadow-lg'
                  : isDark
                  ? 'ring-white/10 opacity-55 hover:opacity-100'
                  : 'ring-black/10 opacity-70 hover:opacity-100'
              }`}
            >
              <img
                src={item.imageAfter || '/placeholder.svg'}
                alt={item.title || 'Результат'}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                crossOrigin="anonymous"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
              <span className="absolute inset-x-0 bottom-0 px-1.5 py-1.5 text-[10px] font-semibold text-white leading-tight text-center truncate">
                {item.title}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
