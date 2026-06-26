import { motion } from 'motion/react';
import {
  IconSun,
  IconMoon,
  IconArrowRight,
  IconPhone,
  IconTelegram,
  IconWhatsApp,
  IconViber,
} from './icons';
import { phoneDigits } from '../lib/content';

const navLinks = [
  { id: 'services-section', label: 'Услуги' },
  { id: 'about-section', label: 'О мастере' },
  { id: 'gallery-section', label: 'Работы' },
  { id: 'faq-section', label: 'Вопросы' },
];

interface Props {
  isDark: boolean;
  toggleTheme: () => void;
  scrollProgress: number;
  scrollToSection: (id: string) => void;
  scrollToBooking: () => void;
  phone: string;
}

export default function Header({ isDark, toggleTheme, scrollProgress, scrollToSection, scrollToBooking, phone }: Props) {
  const radius = 15;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference;

  const digits = phoneDigits(phone);
  const cardBase = `rounded-full border transition-all duration-1000 backdrop-blur-md shadow-lg ${
    isDark ? 'bg-white/5 border-white/10 shadow-black/40' : 'bg-white/50 border-black/5 shadow-slate-200/50'
  }`;
  const ghostBtn = isDark ? 'hover:bg-white/10' : 'hover:bg-black/5';

  const messengers = [
    { label: 'Telegram', href: `https://t.me/+${digits}`, Icon: IconTelegram, color: 'hover:text-sky-400' },
    { label: 'WhatsApp', href: `https://wa.me/${digits}`, Icon: IconWhatsApp, color: 'hover:text-green-500' },
    { label: 'Viber', href: `viber://chat?number=%2B${digits}`, Icon: IconViber, color: 'hover:text-purple-500' },
  ];

  // Кнопка переключения темы с прогресс-кольцом прокрутки вокруг неё.
  const ThemeToggle = () => (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Включить светлую тему' : 'Включить тёмную тему'}
      className="relative w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-transform hover:scale-105 active:scale-95"
    >
      <svg
        className="absolute inset-0 -rotate-90 w-full h-full"
        viewBox="0 0 36 36"
        aria-hidden="true"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(scrollProgress)}
      >
        <circle cx="18" cy="18" r={radius} className={isDark ? 'stroke-white/10' : 'stroke-black/10'} strokeWidth="2.5" fill="transparent" />
        <motion.circle
          cx="18"
          cy="18"
          r={radius}
          className={isDark ? 'stroke-pink-400' : 'stroke-purple-600'}
          strokeWidth="2.5"
          fill="transparent"
          strokeDasharray={circumference}
          animate={{ strokeDashoffset }}
          transition={{ ease: 'easeOut', duration: 0.1 }}
          strokeLinecap="round"
        />
      </svg>
      {isDark ? <IconSun className="text-yellow-400 w-4 h-4" /> : <IconMoon className="text-slate-700 w-4 h-4" />}
    </button>
  );

  return (
    <header className="fixed top-4 sm:top-6 inset-x-0 z-50 px-3 sm:px-4">
      {/* ===== МОБИЛЬНАЯ ВЕРСИЯ: одна цельная панель ===== */}
      <div className={`lg:hidden max-w-[1280px] mx-auto ${cardBase} pl-5 pr-1.5 py-1.5 flex items-center justify-between gap-2`}>
        <button
          onClick={() => scrollToSection('hero-section')}
          className="font-bold text-base whitespace-nowrap tracking-tight shrink-0"
        >
          Виктория<span className={isDark ? 'text-pink-400' : 'text-purple-600'}>.</span>
        </button>

        <div className="flex items-center gap-1.5 shrink-0">
          <ThemeToggle />
          <button
            onClick={scrollToBooking}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
              isDark ? 'bg-pink-400 text-black hover:bg-pink-300' : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            Записаться
            <IconArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ===== DESKTOP-ВЕРСИЯ: три карточки ===== */}
      <div className="hidden lg:flex max-w-[1280px] mx-auto items-center justify-center gap-3">
        {/* ЛЕВАЯ КАРТОЧКА: БРЕНД + НАВИГАЦИЯ */}
        <nav aria-label="Основная навигация" className={`${cardBase} px-5 py-2.5 flex items-center gap-4`}>
          <button onClick={() => scrollToSection('hero-section')} className="font-bold text-base whitespace-nowrap tracking-tight shrink-0">
            Виктория<span className={isDark ? 'text-pink-400' : 'text-purple-600'}>.</span>
          </button>
          <div className="flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium opacity-70 hover:opacity-100 transition-all ${ghostBtn}`}
              >
                {link.label}
              </button>
            ))}
          </div>
        </nav>

        {/* ЦЕНТРАЛЬНАЯ КАРТОЧКА: ПРОГРЕСС + ТЕМА */}
        <div className={`${cardBase} shrink-0 p-1 flex items-center`}>
          <ThemeToggle />
        </div>

        {/* ПРАВАЯ КАРТОЧКА: КОНТАКТЫ + МЕССЕНДЖЕРЫ + CTA */}
        <div className={`${cardBase} px-2 py-2 flex items-center gap-1`}>
          <a
            href={`tel:+${digits}`}
            className={`hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium opacity-80 hover:opacity-100 transition-all ${ghostBtn}`}
          >
            <IconPhone className="w-4 h-4" />
            <span className="whitespace-nowrap">{phone}</span>
          </a>
          <div className="flex items-center gap-0.5">
            {messengers.map(({ label, href, Icon, color }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${label}: ${phone}`}
                className={`w-8 h-8 rounded-full flex items-center justify-center opacity-80 hover:opacity-100 transition-all ${ghostBtn} ${color}`}
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
          <button
            onClick={scrollToBooking}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
              isDark ? 'bg-pink-400 text-black hover:bg-pink-300' : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            Записаться
            <IconArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
