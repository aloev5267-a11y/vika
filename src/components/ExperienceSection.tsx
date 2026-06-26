import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { Advantage } from '../lib/content';
import { advantageIcon } from './icons';

interface ExperienceSectionProps {
  isDark: boolean;
  advantages: Advantage[];
}

const steps = [
  {
    num: '01',
    title: 'Консультация',
    text: 'Обсуждаем зону, тип кожи и волос, отвечаем на вопросы и составляем индивидуальный план процедур.',
  },
  {
    num: '02',
    title: 'Подготовка',
    text: 'Очищаем и дезинфицируем кожу. Используются только стерильные одноразовые иглы.',
  },
  {
    num: '03',
    title: 'Процедура',
    text: 'Тонкая игла вводится в волосяной фолликул, импульс тока разрушает корень волоса навсегда.',
  },
  {
    num: '04',
    title: 'Уход',
    text: 'Наношу успокаивающее средство и даю рекомендации по уходу за кожей после сеанса.',
  },
];

const AUTOPLAY_MS = 5000;

export default function ExperienceSection({ isDark, advantages }: ExperienceSectionProps) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const go = useCallback((i: number) => setActive(((i % steps.length) + steps.length) % steps.length), []);

  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => go(active + 1), AUTOPLAY_MS);
    return () => clearTimeout(t);
  }, [active, paused, go]);

  const accentText = isDark ? 'text-pink-400' : 'text-purple-600';
  const cardBg = isDark ? 'bg-white/5 border-white/10' : 'bg-white/60 border-black/5';

  return (
    <section id="process-section" className="mb-24 sm:mb-32 scroll-mt-28">
      <div className="text-center mb-10">
        <span className={`text-sm font-semibold uppercase tracking-wider ${accentText}`}>Просто и не страшно</span>
        <h2 className="text-3xl sm:text-4xl font-bold mt-3 text-balance">Как проходит процедура</h2>
      </div>

      <div
        className={`relative rounded-[2rem] border backdrop-blur-xl overflow-hidden ${cardBg}`}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Интерактивная лента шагов */}
        <div className="relative px-4 sm:px-8 pt-7">
          {/* соединительная линия */}
          <div className={`absolute left-8 right-8 top-[3.1rem] h-px ${isDark ? 'bg-white/10' : 'bg-black/10'}`} aria-hidden="true" />
          <div className="relative grid grid-cols-4 gap-1 sm:gap-2">
            {steps.map((s, i) => {
              const isActive = i === active;
              const isDone = i < active;
              return (
                <button
                  key={s.num}
                  onClick={() => go(i)}
                  className="group flex flex-col items-center gap-2 focus:outline-none"
                  aria-label={`Шаг ${s.num}: ${s.title}`}
                  aria-current={isActive}
                >
                  <span
                    className={`relative z-10 w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${
                      isActive
                        ? isDark
                          ? 'bg-pink-400 text-black border-pink-400 scale-110 shadow-[0_0_18px_rgba(244,143,177,0.45)]'
                          : 'bg-purple-600 text-white border-purple-600 scale-110 shadow-lg'
                        : isDone
                        ? isDark
                          ? 'bg-pink-400/20 text-pink-400 border-pink-400/40'
                          : 'bg-purple-600/15 text-purple-600 border-purple-600/40'
                        : isDark
                        ? 'bg-transparent text-white/50 border-white/15 group-hover:border-white/40'
                        : 'bg-transparent text-slate-400 border-black/15 group-hover:border-black/40'
                    }`}
                  >
                    {s.num}
                  </span>
                  <span
                    className={`text-[11px] sm:text-sm font-medium text-center leading-tight transition-colors ${
                      isActive ? accentText : isDark ? 'text-white/55' : 'text-slate-500'
                    }`}
                  >
                    {s.title}
                  </span>
                </button>
              );
            })}
          </div>

          {/* прогресс автопроигрывания */}
          <div className={`mt-5 h-1 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-black/10'}`}>
            <motion.div
              key={`${active}-${paused}`}
              className={`h-full rounded-full ${isDark ? 'bg-pink-400' : 'bg-purple-600'}`}
              initial={{ width: '0%' }}
              animate={{ width: paused ? '0%' : '100%' }}
              transition={{ duration: paused ? 0 : AUTOPLAY_MS / 1000, ease: 'linear' }}
            />
          </div>
        </div>

        {/* Детали активного шага */}
        <div className="px-5 sm:px-8 py-7 min-h-[140px] flex items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.35 }}
              className="flex items-start gap-4 sm:gap-6 w-full"
            >
              <span className={`text-5xl sm:text-7xl font-bold leading-none opacity-15 ${accentText}`}>
                {steps[active].num}
              </span>
              <div className="pt-1">
                <h3 className="text-xl sm:text-2xl font-bold mb-2">{steps[active].title}</h3>
                <p className={`text-sm sm:text-base leading-relaxed ${isDark ? 'text-white/70' : 'text-slate-600'}`}>
                  {steps[active].text}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Преимущества — встроенная полоса доверия */}
        {advantages.length > 0 && (
          <div className={`grid grid-cols-2 lg:grid-cols-4 border-t ${isDark ? 'border-white/10' : 'border-black/5'}`}>
            {advantages.slice(0, 4).map((adv, i) => {
              const Icon = advantageIcon(adv.icon);
              return (
                <div
                  key={adv.id ?? i}
                  className={`p-4 sm:p-5 flex flex-col items-center text-center gap-2 ${
                    i % 2 === 0 ? (isDark ? 'border-r border-white/10' : 'border-r border-black/5') : ''
                  } ${i < 2 ? (isDark ? 'border-b border-white/10 lg:border-b-0' : 'border-b border-black/5 lg:border-b-0') : ''} ${
                    i === 2 ? (isDark ? 'lg:border-r lg:border-white/10' : 'lg:border-r lg:border-black/5') : ''
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isDark ? 'bg-pink-400/15 text-pink-400' : 'bg-purple-600/10 text-purple-600'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-sm sm:text-base">{adv.title}</h4>
                  <p className={`text-xs leading-relaxed ${isDark ? 'text-white/55' : 'text-slate-500'}`}>
                    {adv.description}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
