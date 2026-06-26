import { motion } from 'motion/react';
import type { BeforeAfter } from '../lib/content';
import BeforeAfterSlider from './BeforeAfterSlider';

interface GallerySectionProps {
  isDark: boolean;
  items: BeforeAfter[];
}

export default function GallerySection({ isDark, items }: GallerySectionProps) {
  if (!items.length) return null;

  return (
    <section id="gallery-section" className="mb-32 scroll-mt-28">
      <div className="text-center mb-12">
        <span className={`text-sm font-semibold uppercase tracking-wider ${isDark ? 'text-pink-400' : 'text-purple-600'}`}>
          Результаты
        </span>
        <h2 className="text-4xl font-bold mt-3 text-balance">До и после</h2>
        <p className={`mt-3 text-sm ${isDark ? 'text-white/60' : 'text-slate-500'}`}>
          Потяните ползунок, чтобы сравнить результат
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: (i % 3) * 0.1 }}
          >
            <BeforeAfterSlider
              imageBefore={item.imageBefore}
              imageAfter={item.imageAfter}
              alt={item.title}
              className="aspect-[4/5] rounded-2xl border border-black/5"
            />
            {item.title && <p className="mt-3 text-center text-sm font-medium opacity-70">{item.title}</p>}
          </motion.div>
        ))}
      </div>
    </section>
  );
}
