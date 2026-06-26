import { motion } from 'motion/react';
import { IconArrowRight } from './icons';
import HeroGallery from './HeroGallery';
import type { BeforeAfter } from '../lib/content';

const AnimatedRose = ({ isDark }: { isDark: boolean }) => {
  const petals = Array.from({ length: 12 });
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.5, ease: 'easeOut' }}
      className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center pointer-events-none"
      aria-hidden="true"
    >
      <motion.div
        className={`absolute inset-0 rounded-full blur-[60px] opacity-50 ${isDark ? 'bg-pink-500' : 'bg-purple-400'}`}
        animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 80, repeat: Infinity, ease: 'linear' }} className="relative w-full h-full flex items-center justify-center">
        {petals.map((_, i) => (
          <motion.div
            key={`outer-${i}`}
            className={`absolute w-12 h-32 md:w-14 md:h-36 rounded-t-full rounded-b-lg origin-bottom opacity-50 backdrop-blur-sm mix-blend-screen ${isDark ? 'bg-pink-600' : 'bg-purple-400'}`}
            style={{ bottom: '50%' }}
            initial={{ scale: 0, rotate: 0 }}
            animate={{ scale: 1, rotate: i * 30 }}
            transition={{ duration: 2.5, delay: i * 0.15, ease: 'easeOut' }}
          />
        ))}
        {petals.map((_, i) => (
          <motion.div
            key={`middle-${i}`}
            className={`absolute w-10 h-24 md:w-10 md:h-28 rounded-t-full rounded-b-md origin-bottom opacity-70 backdrop-blur-sm ${isDark ? 'bg-pink-500' : 'bg-purple-500'}`}
            style={{ bottom: '50%' }}
            initial={{ scale: 0, rotate: 0 }}
            animate={{ scale: 1, rotate: i * 30 + 15 }}
            transition={{ duration: 2, delay: 1.5 + i * 0.1, ease: 'easeOut' }}
          />
        ))}
        {petals.map((_, i) => (
          <motion.div
            key={`inner-${i}`}
            className={`absolute w-6 h-16 md:w-8 md:h-20 rounded-t-full rounded-b-sm origin-bottom opacity-90 ${isDark ? 'bg-pink-400' : 'bg-purple-600'}`}
            style={{ bottom: '50%' }}
            initial={{ scale: 0, rotate: 0 }}
            animate={{ scale: 1, rotate: i * 30 }}
            transition={{ duration: 1.5, delay: 2.5 + i * 0.1, ease: 'easeOut' }}
          />
        ))}
        <motion.div
          className={`absolute w-6 h-6 md:w-8 md:h-8 rounded-full ${isDark ? 'bg-pink-300' : 'bg-purple-300'} shadow-[0_0_30px_currentColor] z-10`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, delay: 3.5 }}
        />
      </motion.div>
    </motion.div>
  );
};

interface Props {
  isDark: boolean;
  scrollToBooking: () => void;
  beforeAfter: BeforeAfter[];
}

export default function Hero({ isDark, scrollToBooking, beforeAfter }: Props) {
  const hasGallery = beforeAfter.length > 0;

  return (
    <section id="hero-section" className="flex flex-col lg:flex-row items-center justify-between gap-12 mb-32 relative scroll-mt-28">
      <div className="flex-1 text-center lg:text-left z-10">
        <span className={`inline-block mb-5 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide ${isDark ? 'bg-pink-400/10 text-pink-300' : 'bg-purple-600/10 text-purple-700'}`}>
          Электроэпиляция в Минске · 40 BYN
        </span>
        <h1 className="text-5xl lg:text-7xl font-bold leading-tight mb-6 text-balance">
          Ваш путь к <br />
          <span className={`italic ${isDark ? 'text-pink-400' : 'text-purple-600'}`}>идеальной гладкости</span>
        </h1>
        <p className="text-lg opacity-70 mb-10 max-w-xl mx-auto lg:mx-0 text-pretty">
          Электроэпиляция — единственный метод удаления волос навсегда. Бережно, стерильно и с гарантией результата.
        </p>
        <button
          onClick={scrollToBooking}
          className={`inline-flex items-center gap-3 px-8 py-4 rounded-full font-medium transition-all ${isDark ? 'bg-pink-400 text-black hover:bg-pink-300' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
        >
          Записаться<IconArrowRight className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 flex justify-center lg:justify-end items-center z-10 w-full">
        {hasGallery ? <HeroGallery items={beforeAfter} isDark={isDark} /> : <AnimatedRose isDark={isDark} />}
      </div>
    </section>
  );
}
