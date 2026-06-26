import { motion } from 'motion/react';
import type { Advantage } from '../lib/content';
import { advantageIcon } from './icons';

interface AdvantagesSectionProps {
  isDark: boolean;
  advantages: Advantage[];
}

export default function AdvantagesSection({ isDark, advantages }: AdvantagesSectionProps) {
  if (!advantages.length) return null;

  return (
    <section id="advantages-section" className="mb-32 scroll-mt-28">
      <div className="text-center mb-12">
        <span className={`text-sm font-semibold uppercase tracking-wider ${isDark ? 'text-pink-400' : 'text-purple-600'}`}>
          Почему выбирают нас
        </span>
        <h2 className="text-4xl font-bold mt-3 text-balance">Наши преимущества</h2>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {advantages.map((adv, i) => {
          const Icon = advantageIcon(adv.icon);
          return (
            <motion.div
              key={adv.id ?? i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`p-6 rounded-2xl border text-center ${
                isDark ? 'border-white/10 bg-white/5' : 'border-black/5 bg-white/60'
              }`}
            >
              <div
                className={`w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
                  isDark ? 'bg-pink-400/15 text-pink-400' : 'bg-purple-600/10 text-purple-600'
                }`}
              >
                <Icon className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-lg mb-2">{adv.title}</h3>
              <p className={`text-sm leading-relaxed ${isDark ? 'text-white/65' : 'text-slate-600'}`}>
                {adv.description}
              </p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
