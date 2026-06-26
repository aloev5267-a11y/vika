import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { IconChevron } from './icons';

interface FaqSectionProps {
  isDark: boolean;
}

const faqs = [
  {
    q: 'Это больно?',
    a: 'Ощущения индивидуальны и зависят от зоны и болевого порога. Современное оборудование с регулировкой мощности и местная анестезия делают процедуру максимально комфортной. Большинство клиентов описывают ощущения как лёгкое покалывание.',
  },
  {
    q: 'Сколько процедур нужно?',
    a: 'Количество зависит от зоны, густоты и структуры волос. В среднем требуется от 6 до 12 сеансов с интервалом 3–6 недель. Электроэпиляция воздействует на волосы в активной фазе роста, поэтому процедуры повторяют до полного результата.',
  },
  {
    q: 'Это действительно навсегда?',
    a: 'Да. Электроэпиляция — единственный метод удаления волос, признанный методом перманентного удаления. Импульс тока разрушает зону роста волоса, и он больше не вырастает.',
  },
  {
    q: 'Какие есть противопоказания?',
    a: 'Беременность, онкологические заболевания, эпилепсия, сахарный диабет в стадии декомпенсации, кардиостимулятор, острые воспаления и повреждения кожи в зоне обработки. Полный список обсуждается на консультации.',
  },
  {
    q: 'Как подготовиться к процедуре?',
    a: 'За 2–3 дня волоски должны немного отрасти (1–2 мм). Не использовать воск и эпилятор, избегать загара и не наносить кремы в день процедуры. Подробные рекомендации мастер даёт на консультации.',
  },
  {
    q: 'Чем электроэпиляция лучше лазера?',
    a: 'Лазер не работает на светлых, седых и пушковых волосах, а электроэпиляция эффективна для любого типа и цвета волос на любой коже. Это универсальный метод с гарантированным перманентным результатом.',
  },
];

export default function FaqSection({ isDark }: FaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq-section" className="mb-32 scroll-mt-28">
      <div className="text-center mb-12">
        <span className={`text-sm font-semibold uppercase tracking-wider ${isDark ? 'text-pink-400' : 'text-purple-600'}`}>
          Отвечаем честно
        </span>
        <h2 className="text-4xl font-bold mt-3 text-balance">Частые вопросы</h2>
      </div>

      <div className="max-w-3xl mx-auto space-y-3">
        {faqs.map((faq, i) => {
          const isOpen = openIndex === i;
          return (
            <div
              key={i}
              className={`rounded-2xl border overflow-hidden transition-colors ${
                isDark ? 'border-white/10 bg-white/5' : 'border-black/5 bg-white/60'
              }`}
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="w-full flex items-center justify-between gap-4 p-5 text-left"
              >
                <span className="font-semibold text-base">{faq.q}</span>
                <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }} className="shrink-0">
                  <IconChevron className={`w-5 h-5 ${isDark ? 'text-pink-400' : 'text-purple-600'}`} />
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className={`px-5 pb-5 text-sm leading-relaxed ${isDark ? 'text-white/65' : 'text-slate-600'}`}>
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
