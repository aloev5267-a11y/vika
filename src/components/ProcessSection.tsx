import { motion } from 'motion/react';

interface ProcessSectionProps {
  isDark: boolean;
}

const steps = [
  {
    num: '01',
    title: 'Консультация',
    text: 'Обсуждаем зону, тип кожи и волос, отвечаем на вопросы и составляем план процедур.',
  },
  {
    num: '02',
    title: 'Подготовка',
    text: 'Очищаем и дезинфицируем кожу. Используем только стерильные одноразовые иглы.',
  },
  {
    num: '03',
    title: 'Процедура',
    text: 'Тонкая игла вводится в волосяной фолликул, импульс тока разрушает корень волоса.',
  },
  {
    num: '04',
    title: 'Уход',
    text: 'Наносим успокаивающее средство и даём рекомендации по уходу за кожей после сеанса.',
  },
];

export default function ProcessSection({ isDark }: ProcessSectionProps) {
  return (
    <section id="process-section" className="mb-32 scroll-mt-28">
      <div className="text-center mb-12">
        <span className={`text-sm font-semibold uppercase tracking-wider ${isDark ? 'text-pink-400' : 'text-purple-600'}`}>
          Просто и не страшно
        </span>
        <h2 className="text-4xl font-bold mt-3 text-balance">Как проходит процедура</h2>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {steps.map((step, i) => (
          <motion.div
            key={step.num}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className={`relative p-6 rounded-2xl border h-full ${
              isDark ? 'border-white/10 bg-white/5' : 'border-black/5 bg-white/60'
            }`}
          >
            <span className={`text-5xl font-bold opacity-15 ${isDark ? 'text-pink-400' : 'text-purple-600'}`}>
              {step.num}
            </span>
            <h3 className="text-lg font-bold mt-2 mb-2">{step.title}</h3>
            <p className={`text-sm leading-relaxed ${isDark ? 'text-white/65' : 'text-slate-600'}`}>{step.text}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
