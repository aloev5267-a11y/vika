import { motion } from 'motion/react';
import type { SiteSettings } from '../lib/content';
import { phoneDigits, INSTAGRAM_URL, INSTAGRAM_HANDLE } from '../lib/content';
import { IconMapPin, IconTelegram, IconWhatsApp, IconViber, IconPhone, IconInstagram } from './icons';

interface ContactSectionProps {
  isDark: boolean;
  settings: SiteSettings;
}

export default function ContactSection({ isDark, settings }: ContactSectionProps) {
  const digits = phoneDigits(settings.phone);
  const cardBg = isDark ? 'border-white/10 bg-white/5' : 'border-black/5 bg-white/60';

  return (
    <section id="contact-section" className="mb-32 scroll-mt-28">
      <div className="text-center mb-12">
        <span className={`text-sm font-semibold uppercase tracking-wider ${isDark ? 'text-pink-400' : 'text-purple-600'}`}>
          Контакты
        </span>
        <h2 className="text-4xl font-bold mt-3 text-balance">Как нас найти</h2>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* ИНФОРМАЦИЯ */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className={`p-8 rounded-3xl border flex flex-col gap-6 ${cardBg}`}
        >
          <div className="flex items-start gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${isDark ? 'bg-pink-400/15 text-pink-400' : 'bg-purple-600/10 text-purple-600'}`}>
              <IconMapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm opacity-60 mb-1">Адрес</p>
              <p className="font-medium">{settings.address}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${isDark ? 'bg-pink-400/15 text-pink-400' : 'bg-purple-600/10 text-purple-600'}`}>
              <IconPhone className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm opacity-60 mb-1">Телефон</p>
              <a href={`tel:+${digits}`} className="font-medium hover:underline">
                {settings.phone}
              </a>
            </div>
          </div>

          <div>
            <p className="text-sm opacity-60 mb-3">Напишите в мессенджер</p>
            <div className="flex gap-3">
              <a
                href={`https://t.me/+${digits}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram"
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white transition-transform hover:scale-105"
                style={{ backgroundColor: '#229ED9' }}
              >
                <IconTelegram className="w-6 h-6" />
              </a>
              <a
                href={`https://wa.me/${digits}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white transition-transform hover:scale-105"
                style={{ backgroundColor: '#25D366' }}
              >
                <IconWhatsApp className="w-6 h-6" />
              </a>
              <a
                href={`viber://chat?number=%2B${digits}`}
                aria-label="Viber"
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white transition-transform hover:scale-105"
                style={{ backgroundColor: '#7360F2' }}
              >
                <IconViber className="w-6 h-6" />
              </a>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white transition-transform hover:scale-105"
                style={{ background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' }}
              >
                <IconInstagram className="w-6 h-6" />
              </a>
            </div>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 mt-4 text-sm font-medium transition-opacity hover:opacity-80 ${isDark ? 'text-pink-400' : 'text-purple-600'}`}
            >
              <IconInstagram className="w-4 h-4" />
              @{INSTAGRAM_HANDLE}
            </a>
          </div>
        </motion.div>

        {/* КАРТА */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className={`rounded-3xl border overflow-hidden min-h-[300px] ${cardBg}`}
        >
          {settings.map_embed ? (
            <iframe
              src={settings.map_embed}
              title="Карта проезда"
              className="w-full h-full min-h-[300px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          ) : (
            <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center gap-3 opacity-40">
              <IconMapPin className="w-12 h-12" />
              <span className="text-sm">Карта появится здесь</span>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
