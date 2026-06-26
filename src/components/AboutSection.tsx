import { motion } from 'motion/react';
import type { SiteSettings } from '../lib/content';
import { IconAward, IconCheck } from './icons';

interface AboutSectionProps {
  isDark: boolean;
  settings: SiteSettings;
}

export default function AboutSection({ isDark, settings }: AboutSectionProps) {
  let certificates: string[] = [];
  try {
    const parsed = JSON.parse(settings.master_certificates || '[]');
    if (Array.isArray(parsed)) certificates = parsed.filter((c) => typeof c === 'string');
  } catch {
    certificates = [];
  }

  return (
    <section id="about-section" className="mb-32 scroll-mt-28">
      <div className="flex flex-col lg:flex-row gap-12 items-center">
        {/* ФОТО МАСТЕРА */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="w-full lg:w-2/5 shrink-0"
        >
          <div
            className={`relative aspect-[4/5] rounded-3xl overflow-hidden border ${
              isDark ? 'border-white/10 bg-white/5' : 'border-black/5 bg-black/5'
            }`}
          >
            {settings.master_photo ? (
              <img
                src={settings.master_photo || '/placeholder.svg'}
                alt={settings.master_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3 opacity-40">
                <IconAward className="w-16 h-16" />
                <span className="text-sm">Фото мастера</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* ОПИСАНИЕ */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex-1"
        >
          <span className={`text-sm font-semibold uppercase tracking-wider ${isDark ? 'text-pink-400' : 'text-purple-600'}`}>
            О мастере
          </span>
          <h2 className="text-4xl font-bold mt-3 mb-4 text-balance">{settings.master_name}</h2>
          <p className={`text-base font-medium mb-5 ${isDark ? 'text-pink-300' : 'text-purple-700'}`}>
            {settings.master_experience}
          </p>
          <p className={`text-lg leading-relaxed mb-8 ${isDark ? 'text-white/70' : 'text-slate-600'}`}>
            {settings.master_bio}
          </p>

          {certificates.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-sm uppercase tracking-wider opacity-60">Сертификаты и дипломы</h3>
              <ul className="grid sm:grid-cols-2 gap-3">
                {certificates.map((cert, i) => (
                  <li
                    key={i}
                    className={`flex items-center gap-3 p-3 rounded-xl border ${
                      isDark ? 'border-white/10 bg-white/5' : 'border-black/5 bg-black/5'
                    }`}
                  >
                    <IconCheck className={`w-5 h-5 shrink-0 ${isDark ? 'text-pink-400' : 'text-purple-600'}`} />
                    <span className="text-sm">{cert}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
