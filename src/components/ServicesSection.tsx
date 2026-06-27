import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { Service } from '../lib/data';
import { IconArrowRight, IconBody, IconBikini, IconLegs } from './icons';

interface Props {
  isDark: boolean;
  services: Service[];
  scrollToBooking: (serviceId?: string) => void;
}

// Иконка для каждой зоны по её id (с запасным вариантом).
const serviceIcons: Record<string, (p: { className?: string }) => React.ReactElement> = {
  body: IconBody,
  bikini: IconBikini,
  legs: IconLegs,
};

export default function ServicesSection({ isDark, services, scrollToBooking }: Props) {
  const [activeId, setActiveId] = useState(services[0]?.id);
  const active = services.find((s) => s.id === activeId) ?? services[0];
  const ActiveIcon = serviceIcons[active.id] ?? IconBody;

  const accent = isDark ? 'text-pink-400' : 'text-purple-600';

  return (
    <section id="services-section" className="mb-24 sm:mb-32 relative scroll-mt-28">
      <div className="mb-8 sm:mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-balance">Наши услуги</h2>
        <p className="text-sm opacity-60 mt-2 max-w-md text-pretty">
          Оплата за время работы — 40 BYN за час, независимо от количества выбранных зон.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4 lg:gap-6">
        {/* СЕЛЕКТОР ЗОН: на мобильном — сетка 2×2, на десктопе — вертикальный список */}
        <div
          role="tablist"
          aria-label="Зоны услуг"
          className="grid grid-cols-2 lg:flex lg:flex-col gap-2"
        >
          {services.map((s) => {
            const Icon = serviceIcons[s.id] ?? IconBody;
            const isActive = s.id === active.id;
            return (
              <button
                key={s.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveId(s.id)}
                className={`group flex items-center gap-3 w-full rounded-2xl border px-4 py-3.5 text-left transition-all ${
                  isActive
                    ? isDark
                      ? 'bg-pink-500/10 border-pink-400/60 shadow-[0_0_20px_rgba(244,143,177,0.12)]'
                      : 'bg-purple-600 border-purple-600 text-white shadow-lg'
                    : isDark
                      ? 'bg-white/5 border-white/10 hover:bg-white/10'
                      : 'bg-white/50 border-black/5 hover:bg-white/80'
                }`}
              >
                <span
                  className={`flex items-center justify-center w-9 h-9 rounded-xl shrink-0 transition-colors ${
                    isActive
                      ? isDark
                        ? 'bg-pink-400/15 text-pink-400'
                        : 'bg-white/20 text-white'
                      : isDark
                        ? 'bg-white/5 text-white/70'
                        : 'bg-black/5 text-slate-600'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </span>
                <span className="flex flex-col min-w-0">
                  <span className="font-semibold text-sm truncate">{s.title}</span>
                  <span className={`text-xs ${isActive ? 'opacity-80' : 'opacity-50'}`}>{s.price}</span>
                </span>
              </button>
            );
          })}
        </div>

        {/* ДЕТАЛЬНАЯ КАРТОЧКА АКТИВНОЙ ЗОНЫ */}
        <div
          className={`relative overflow-hidden rounded-3xl border p-6 sm:p-10 flex flex-col justify-between min-h-[280px] ${
            isDark ? 'bg-white/5 border-white/10' : 'bg-white/60 border-black/5 shadow-xl'
          }`}
        >
          <div
            className={`absolute -top-16 -right-16 w-56 h-56 rounded-full blur-[90px] opacity-20 pointer-events-none ${
              isDark ? 'bg-pink-500' : 'bg-purple-400'
            }`}
            aria-hidden="true"
          />

          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="relative z-10"
            >
              <span
                className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-5 ${
                  isDark ? 'bg-pink-400/10 text-pink-400' : 'bg-purple-600/10 text-purple-600'
                }`}
              >
                <ActiveIcon className="w-7 h-7" />
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold mb-3">{active.title}</h3>
              <p className="text-base opacity-70 leading-relaxed max-w-lg text-pretty">{active.desc}</p>
            </motion.div>
          </AnimatePresence>

          <div className="relative z-10 mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6 border-t border-dashed border-current/10">
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-bold font-mono ${accent}`}>{active.price}</span>
              <span className="text-sm opacity-50">/ час</span>
            </div>
            <button
              onClick={() => scrollToBooking(active.id)}
              className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-semibold text-sm transition-all ${
                isDark ? 'bg-pink-400 text-black hover:bg-pink-300' : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              Записаться на {active.title.toLowerCase()}
              <IconArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
