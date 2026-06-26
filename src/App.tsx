import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import IntroLoader from "./components/IntroLoader";
import BookingSection from "./components/BookingSection";
import { services, testimonials, timeSlots } from "./lib/data";

// --- ИКОНКИ ---
const IconMoon = ({ className }: { className?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconSun = ({ className }: { className?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const IconArrowRight = ({ className }: { className?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconPhone = ({ className }: { className?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.13.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0122 16.92z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const navLinks = [
  { id: "services-section", label: "Услуги" },
  { id: "booking-section", label: "Запись" },
  { id: "reviews-section", label: "Отзывы" },
];

// --- КОМПОНЕНТ АНИМИРОВАННОЙ РОЗЫ ---
const AnimatedRose = ({ isDark }: { isDark: boolean }) => {
  const petals = Array.from({ length: 12 });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.5, ease: "easeOut" }}
      className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center pointer-events-none"
      aria-hidden="true"
    >
      <motion.div
        className={`absolute inset-0 rounded-full blur-[60px] opacity-50 ${isDark ? "bg-pink-500" : "bg-purple-400"}`}
        animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
        className="relative w-full h-full flex items-center justify-center"
      >
        {/* Лепестки */}
        {petals.map((_, i) => (
          <motion.div
            key={`outer-${i}`}
            className={`absolute w-12 h-32 md:w-14 md:h-36 rounded-t-full rounded-b-lg origin-bottom opacity-50 backdrop-blur-sm mix-blend-screen ${isDark ? "bg-pink-600" : "bg-purple-400"}`}
            style={{ bottom: "50%" }}
            initial={{ scale: 0, rotate: 0 }}
            animate={{ scale: 1, rotate: i * 30 }}
            transition={{ duration: 2.5, delay: i * 0.15, ease: "easeOut" }}
          />
        ))}
        {petals.map((_, i) => (
          <motion.div
            key={`middle-${i}`}
            className={`absolute w-10 h-24 md:w-10 md:h-28 rounded-t-full rounded-b-md origin-bottom opacity-70 backdrop-blur-sm ${isDark ? "bg-pink-500" : "bg-purple-500"}`}
            style={{ bottom: "50%" }}
            initial={{ scale: 0, rotate: 0 }}
            animate={{ scale: 1, rotate: (i * 30) + 15 }}
            transition={{ duration: 2, delay: 1.5 + i * 0.1, ease: "easeOut" }}
          />
        ))}
        {petals.map((_, i) => (
          <motion.div
            key={`inner-${i}`}
            className={`absolute w-6 h-16 md:w-8 md:h-20 rounded-t-full rounded-b-sm origin-bottom opacity-90 ${isDark ? "bg-pink-400" : "bg-purple-600"}`}
            style={{ bottom: "50%" }}
            initial={{ scale: 0, rotate: 0 }}
            animate={{ scale: 1, rotate: (i * 30) }}
            transition={{ duration: 1.5, delay: 2.5 + i * 0.1, ease: "easeOut" }}
          />
        ))}
        <motion.div
          className={`absolute w-6 h-6 md:w-8 md:h-8 rounded-full ${isDark ? "bg-pink-300" : "bg-purple-300"} shadow-[0_0_30px_currentColor] z-10`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, delay: 3.5 }}
        />
      </motion.div>
    </motion.div>
  );
};

type Notification = { text: string; type: "success" | "error" };

export default function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [isDark, setIsDark] = useState(true);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [activeServiceId, setActiveServiceId] = useState(services[0].id);

  // Состояние прогресса прокрутки (от 0 до 100)
  const [scrollProgress, setScrollProgress] = useState(0);

  // Параметры SVG-окружности для индикатора (r = 13)
  const radius = 13;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference;

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        const currentProgress = (window.scrollY / totalScroll) * 100;
        setScrollProgress(currentProgress);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => setIsDark((prev) => !prev);

  const scrollToBooking = (serviceId?: string) => {
    if (serviceId) {
      setActiveServiceId(serviceId);
    }
    scrollToSection("booking-section");
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Показ тоста. Уведомление в Telegram теперь отправляется на стороне сервера.
  const notify = (text: string, type: Notification["type"] = "success") => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <>
      {showIntro && <IntroLoader onComplete={() => setShowIntro(false)} />}
      <div className={`min-h-screen relative transition-colors duration-1000 ${isDark ? "bg-[#0a0a0a] text-white" : "bg-[#fdf5f2] text-slate-900"}`}>

        {/* ГЛОБАЛЬНЫЙ ФОН */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
          <div className={`absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full blur-[160px] opacity-25 transition-colors duration-1000 ${isDark ? "bg-purple-600" : "bg-pink-300"}`} />
          <div className={`absolute -top-20 -right-40 w-[650px] h-[650px] rounded-full blur-[160px] opacity-25 transition-colors duration-1000 ${isDark ? "bg-pink-500" : "bg-purple-400"}`} />
        </div>

        {/* ШАПКА: ТРИ ПАРЯЩИЕ КАРТОЧКИ */}
        <header className="fixed top-6 inset-x-0 z-50 px-4">
          <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-3">

            {/* ЛЕВАЯ КАРТОЧКА: БРЕНД + НАВИГАЦИЯ */}
            <nav
              aria-label="Основная навигация"
              className={`flex-1 min-w-0 px-5 py-2.5 rounded-full border flex items-center gap-5 transition-all duration-1000 backdrop-blur-md shadow-lg ${
                isDark ? "bg-white/5 border-white/10 shadow-black/40" : "bg-white/40 border-black/5 shadow-slate-200/50"
              }`}
            >
              <button
                onClick={() => scrollToSection("hero-section")}
                className="font-bold text-base whitespace-nowrap tracking-tight shrink-0"
              >
                Lumière<span className={isDark ? "text-pink-400" : "text-purple-600"}>.</span>
              </button>
              <div className="hidden lg:flex items-center gap-1">
                {navLinks.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => scrollToSection(link.id)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium opacity-70 hover:opacity-100 transition-all ${
                      isDark ? "hover:bg-white/10" : "hover:bg-black/5"
                    }`}
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            </nav>

            {/* ЦЕНТРАЛЬНАЯ КАРТОЧКА: КОМПАКТНЫЙ ПРОГРЕСС + ТЕМА */}
            <div
              className={`shrink-0 p-1 rounded-full border flex items-center gap-1 transition-all duration-1000 backdrop-blur-md shadow-lg ${
                isDark ? "bg-white/5 border-white/10 shadow-black/40" : "bg-white/40 border-black/5 shadow-slate-200/50"
              }`}
            >
              {/* КРУГ-ПРОГРЕСС ПРОКРУТКИ СТРАНИЦЫ */}
              <div
                className="flex items-center justify-center relative w-8 h-8"
                role="progressbar"
                aria-label="Прогресс прокрутки страницы"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(scrollProgress)}
              >
                <svg className="-rotate-90 w-full h-full" viewBox="0 0 32 32" aria-hidden="true">
                  <circle
                    cx="16"
                    cy="16"
                    r={radius}
                    className={isDark ? "stroke-white/10" : "stroke-black/5"}
                    strokeWidth="2.5"
                    fill="transparent"
                  />
                  <motion.circle
                    cx="16"
                    cy="16"
                    r={radius}
                    className={isDark ? "stroke-pink-400" : "stroke-purple-600"}
                    strokeWidth="2.5"
                    fill="transparent"
                    strokeDasharray={circumference}
                    animate={{ strokeDashoffset }}
                    transition={{ ease: "easeOut", duration: 0.1 }}
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              {/* КНОПКА ПЕРЕКЛЮЧЕНИЯ ТЕМЫ */}
              <button
                onClick={toggleTheme}
                aria-label={isDark ? "Включить светлую тему" : "Включить тёмную тему"}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 hover:scale-105 active:scale-95 ${
                  isDark ? "hover:bg-white/10" : "hover:bg-black/5"
                }`}
              >
                {isDark ? <IconSun className="text-yellow-400 w-4 h-4" /> : <IconMoon className="text-slate-700 w-4 h-4" />}
              </button>
            </div>

            {/* ПРАВАЯ КАРТОЧКА: КОНТАКТ + CTA */}
            <div
              className={`flex-1 min-w-0 px-2 py-2 rounded-full border flex items-center justify-end gap-2 transition-all duration-1000 backdrop-blur-md shadow-lg ${
                isDark ? "bg-white/5 border-white/10 shadow-black/40" : "bg-white/40 border-black/5 shadow-slate-200/50"
              }`}
            >
              <a
                href="tel:+79000000000"
                className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium opacity-80 hover:opacity-100 transition-all ${
                  isDark ? "hover:bg-white/10" : "hover:bg-black/5"
                }`}
              >
                <IconPhone className="w-4 h-4" />
                <span className="whitespace-nowrap">+7 900 000-00-00</span>
              </a>
              <button
                onClick={() => scrollToBooking()}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                  isDark ? "bg-pink-400 text-black hover:bg-pink-300" : "bg-slate-900 text-white hover:bg-slate-800"
                }`}
              >
                Записаться
                <IconArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* КОНТЕНТ */}
        <main className="relative pt-32 pb-20 px-6 max-w-[1440px] mx-auto z-10">

          {/* HERO СЕКЦИЯ */}
          <section id="hero-section" className="flex flex-col lg:flex-row items-center justify-between gap-12 mb-32 relative scroll-mt-28">
            <div className="flex-1 text-center lg:text-left z-10">
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight mb-6 text-balance">
                Ваш путь к <br />
                <span className={`italic ${isDark ? "text-pink-400" : "text-purple-600"}`}>
                  идеальной гладкости
                </span>
              </h1>
              <p className="text-lg opacity-70 mb-10 max-w-xl mx-auto lg:mx-0 text-pretty">
                Электроэпиляция — единственный метод удаления волос навсегда.
              </p>
              <button
                onClick={() => scrollToBooking()}
                className={`inline-flex items-center gap-3 px-8 py-4 rounded-full font-medium transition-all ${isDark ? "bg-pink-400 text-black hover:bg-pink-300" : "bg-slate-900 text-white hover:bg-slate-800"}`}
              >
                Записаться<IconArrowRight className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 flex justify-center lg:justify-end items-center z-10 w-full">
              <AnimatedRose isDark={isDark} />
            </div>
          </section>

          {/* СЕКЦИЯ УСЛУГ */}
          <section id="services-section" className="mb-32 relative scroll-mt-28">
            <h2 className="text-4xl font-bold mb-12">Наши услуги</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
              {services.map((service) => (
                <div key={service.id} className={`p-8 rounded-3xl border flex flex-col justify-between transition-all duration-300 ${isDark ? "bg-white/5 border-white/10 hover:border-pink-500/30" : "bg-white/40 border-black/5 hover:border-purple-500/20 hover:shadow-lg"}`}>
                  <div className="mb-8">
                    <h3 className="text-xl font-bold mb-2">{service.title}</h3>
                    <p className="text-sm opacity-60">{service.desc}</p>
                  </div>
                  <div className="flex justify-between items-center gap-4 pt-6 border-t border-dashed border-white/10">
                    <span className="font-mono font-medium text-lg whitespace-nowrap">{service.price}</span>
                    <button
                      onClick={() => scrollToBooking(service.id)}
                      className={`flex items-center gap-2 px-5 py-3 rounded-full font-medium transition-all text-sm whitespace-nowrap ${isDark ? "bg-pink-400 text-black hover:bg-pink-300" : "bg-slate-900 text-white hover:bg-slate-800"}`}
                    >
                      Записаться
                      <IconArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* БЛОК БРОНИРОВАНИЯ */}
          <div id="booking-section" className="scroll-mt-24">
            <BookingSection
              isDark={isDark}
              services={services}
              timeSlots={timeSlots}
              selectedServiceId={activeServiceId}
              onServiceChange={setActiveServiceId}
              onNotify={notify}
            />
          </div>

          {/* ОТЗЫВЫ */}
          <section id="reviews-section" className="mb-32 scroll-mt-28">
            <h2 className="text-4xl font-bold mb-12 text-center">Ощущения клиентов</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[240px]">
              {testimonials.map((t, idx) => (
                <div key={idx} className={`p-10 rounded-[2.5rem] border flex flex-col justify-between ${isDark ? "bg-white/5 border-white/10" : "bg-white/70 border-black/5"}`}>
                  <p className="text-lg font-medium">«{t.text}»</p>
                  <span className="text-sm font-bold opacity-60">{t.author}</span>
                </div>
              ))}
            </div>
          </section>
        </main>

        {/* УВЕДОМЛЕНИЯ */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              role="status"
              aria-live="polite"
              className={`fixed bottom-8 left-1/2 -translate-x-1/2 p-6 rounded-3xl font-bold z-50 shadow-2xl ${
                notification.type === "error" ? "bg-red-500 text-white" : "bg-pink-400 text-black"
              }`}
            >
              {notification.text}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
