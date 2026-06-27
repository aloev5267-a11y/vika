import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { Service } from '../lib/data';
import { IconArrowRight, IconBody, IconBikini, IconLegs, IconCheck } from './icons';

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

// Доп. детали для карточки услуги. Держим локально, чтобы не менять
// общий тип Service (он переиспользуется бэкендом).
const serviceDetails: Record<string, { tagline: string; includes: string[] }> = {
  body: {
    tagline: 'Руки, плечи, спина и живот',
    includes: ['Любые зоны тела', 'Стерильные одноразовые иглы', 'Подбор силы тока под вашу кожу'],
  },
  bikini: {
    tagline: 'Деликатно и гигиенично',
    includes: ['Классика или глубокое бикини', 'Анестезия по желанию', 'Полная конфиденциальность'],
  },
  legs: {
    tagline: 'Идеальная гладкость надолго',
    includes: ['Голень и бёдра полностью', 'Работа по всей длине', 'Видимый результат уже после курса'],
  },
};

export default function ServicesSection({ isDark, services, scrollToBooking }: Props) {
  const [activeId, setActiveId] = useState(services[0]?.id);
  const active = services.find((s) => s.id === activeId) ?? services[0];
  const ActiveIcon = serviceIcons[active.id] ?? IconBody;
  const activeDetail = serviceDetails[active.id];

  const accent = isDark ? 'text-pink-400' : 'text-purple-600';

  return (
    <section id="services-section" className="mb-24 sm:mb-32 relative scroll-mt-28">
      {/* ЗАГОЛОВОК */}
      <div className="mb-8 sm:mb-12 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <span
            className={`inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] mb-3 ${accent}`}
          >
            <span className={`h-px w-6 ${isDark ? 'bg-pink-400/60' : 'bg-purple-600/60'}`} />
            Прайс
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-balance">Наши услуги</h2>
        </div>
        {/* Прайс-пилюля */}
        <div
          className={`inline-flex items-center gap-3 self-start rounded-2xl border px-5 py-3 ${
            isDark ? 'bg-white/5 border-white/10' : 'bg-white/70 border-black/5 shadow-sm'
          }`}
        >
          <div className="flex flex-col">
            <span className="text-[11px] uppercase tracking-wide opacity-50">Единая ставка</span>
            <span className="text-sm font-semibold">Оплата за время</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className={`text-2xl font-bold font-mono ${accent}`}>40</span>
            <span className="text-sm opacity-60">BYN / час</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4 lg:gap-6 items-stretch">
        {/* СЕЛЕКТОР ЗОН */}
        <div role="tablist" aria-label="Зоны услуг" className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-col lg:h-full gap-2 lg:gap-3">
          {services.map((s, i) => {
            const Icon = serviceIcons[s.id] ?? IconBody;
            const isActive = s.id === active.id;
            return (
              <button
                key={s.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveId(s.id)}
                className={`group relative flex items-center gap-3 w-full lg:flex-1 overflow-hidden rounded-2xl border px-4 py-3.5 lg:py-4 text-left transition-all duration-300 hover:-translate-y-0.5 ${
                  isActive
                    ? isDark
                      ? 'bg-pink-500/10 border-pink-400/60 shadow-[0_0_24px_rgba(244,143,177,0.14)]'
                      : 'bg-purple-600 border-purple-600 text-white shadow-lg'
                    : isDark
                      ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                      : 'bg-white/50 border-black/5 hover:bg-white/90 hover:border-black/10'
                }`}
              >
                {/* Активный индикатор-полоска слева */}
                <span
                  className={`absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r-full transition-all duration-300 ${
                    isActive
                      ? isDark
                        ? 'bg-pink-400 opacity-100'
                        : 'bg-white opacity-100'
                      : 'opacity-0'
                  }`}
                  aria-hidden="true"
                />
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
                <span className="flex flex-col min-w-0 flex-1">
                  <span className="font-semibold text-sm truncate">{s.title}</span>
                  <span className={`text-xs ${isActive ? 'opacity-80' : 'opacity-50'}`}>
                    {serviceDetails[s.id]?.tagline ?? s.price}
                  </span>
                </span>
                {/* Стрелка у активного пункта на десктопе */}
                <IconArrowRight
                  className={`hidden lg:block w-4 h-4 shrink-0 transition-all ${
                    isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-1'
                  }`}
                />
                {/* Порядковый номер */}
                <span
                  className={`lg:hidden text-xs font-mono tabular-nums ${isActive ? 'opacity-60' : 'opacity-30'}`}
                >
                  0{i + 1}
                </span>
              </button>
            );
          })}
        </div>

        {/* ДЕТАЛЬНАЯ КАРТОЧКА АКТИВНОЙ ЗОНЫ */}
        <div
          className={`relative overflow-hidden rounded-3xl border p-6 sm:p-10 flex flex-col justify-between min-h-[320px] ${
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
              <p className="text-base opacity-70 leading-relaxed max-w-lg text-pretty mb-6">{active.desc}</p>

              {/* СПИСОК "ЧТО ВХОДИТ" */}
              {activeDetail && (
                <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2.5 max-w-lg">
                  {activeDetail.includes.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm">
                      <span
                        className={`flex items-center justify-center w-5 h-5 rounded-full shrink-0 mt-0.5 ${
                          isDark ? 'bg-pink-400/15 text-pink-400' : 'bg-purple-600/10 text-purple-600'
                        }`}
                      >
                        <IconCheck className="w-3 h-3" />
                      </span>
                      <span className="opacity-80 text-pretty">{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="relative z-10 mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6 border-t border-dashed border-current/10">
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-bold font-mono ${accent}`}>{active.price}</span>
              <span className="text-sm opacity-50">/ час работы</span>
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
