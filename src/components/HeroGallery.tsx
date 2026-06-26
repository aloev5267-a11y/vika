import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { BeforeAfter } from '../lib/content';
import BeforeAfterSlider from './BeforeAfterSlider';

interface Props {
  items: BeforeAfter[];
  isDark: boolean;
}

/**
 * Вертикальный аккордеон "до/после" для правой части hero.
 * Активный элемент раскрыт и показывает интерактивное сравнение,
 * остальные свёрнуты в тонкие плитки. Клик разворачивает выбранный.
 */
export default function HeroGallery({ items, isDark }: Props) {
  const [active, setActive] = useState(0);
  const visible = items.slice(0, 4);

  return (
    <div className="w-full max-w-md flex flex-col gap-3 h-[440px] md:h-[520px]">
      {visible.map((item, idx) => {
        const isActive = idx === active;
        return (
          <motion.div
            key={item.id}
            layout
            onClick={() => !isActive && setActive(idx)}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
            className={`relative rounded-3xl overflow-hidden border cursor-pointer ${
              isDark ? 'border-white/10' : 'border-black/10'
            } ${isActive ? 'flex-[6]' : 'flex-1 hover:opacity-90'}`}
          >
            {isActive ? (
              <div className="absolute inset-0">
                <BeforeAfterSlider imageBefore={item.imageBefore} imageAfter={item.imageAfter} alt={item.title} className="w-full h-full" />
                {item.title && (
                  <div className="absolute top-3 left-3 text-xs font-semibold px-3 py-1.5 rounded-full bg-black/60 text-white backdrop-blur-sm pointer-events-none">
                    {item.title}
                  </div>
                )}
              </div>
            ) : (
              <>
                <img src={item.imageAfter || '/placeholder.svg'} alt={item.title || 'Результат'} className="absolute inset-0 w-full h-full object-cover" crossOrigin="anonymous" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-3 flex items-center justify-between">
                  <span className="text-xs font-semibold text-white truncate">{item.title || 'Смотреть результат'}</span>
                  <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-white/90 text-black shrink-0">До / После</span>
                </div>
              </>
            )}
          </motion.div>
        );
      })}
      <AnimatePresence />
    </div>
  );
}
