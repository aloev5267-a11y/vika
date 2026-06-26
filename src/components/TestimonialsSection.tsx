import { motion } from 'motion/react';
import type { Testimonial } from '../lib/content';

interface TestimonialsSectionProps {
  isDark: boolean;
  testimonials: Testimonial[];
}

export default function TestimonialsSection({ isDark, testimonials }: TestimonialsSectionProps) {
  if (!testimonials.length) return null;

  return (
    <section id="reviews-section" className="mb-32 scroll-mt-28">
      <h2 className="text-4xl font-bold mb-12 text-center text-balance">Ощущения клиентов</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.id ?? i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className={`p-8 rounded-3xl border ${isDark ? 'border-white/10 bg-white/5' : 'border-black/5 bg-white/60'}`}
          >
            <div className={`text-5xl leading-none mb-4 ${isDark ? 'text-pink-400/40' : 'text-purple-600/30'}`}>“</div>
            <p className={`text-base leading-relaxed mb-6 ${isDark ? 'text-white/80' : 'text-slate-700'}`}>{t.text}</p>
            <p className={`font-semibold text-sm ${isDark ? 'text-pink-400' : 'text-purple-600'}`}>{t.author}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
