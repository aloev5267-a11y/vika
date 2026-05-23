"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import IntroLoader from "./components/IntroLoader";
import BookingSection from "./components/BookingSection";

// --- КОНСТАНТЫ TELEGRAM ---
const TELEGRAM_BOT_TOKEN = "8969405850:AAE_JwZRNzELEb17kYG1ZVeoHCgzvNbZwNQ"; 
const TELEGRAM_CHAT_ID = "8163122101"; 

// --- ИКОНКИ ---
const IconMoon = ({ className }: { className?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconSun = ({ className }: { className?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const IconArrowRight = ({ className }: { className?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// --- КОМПОНЕНТ АНИМИРОВАННОЙ РОЗЫ ---
const AnimatedRose = ({ isDark }: { isDark: boolean }) => {
  const petals = Array.from({ length: 12 });
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.5, ease: "easeOut" }}
      className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center pointer-events-none"
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

const services = [
  { id: "face", title: "Лицо", desc: "Удаление волос над губой, подбородке и щеках.", price: "От 1500₽" },
  { id: "body", title: "Тело", desc: "Руки, ноги, спина. Полная гладкость навсегда.", price: "От 3000₽" },
  { id: "bikini", title: "Бикини", desc: "Деликатные зоны. Комфорт и гигиена.", price: "От 2500₽" },
  { id: "legs", title: "Ноги полностью", desc: "Безупречный результат для ваших ног.", price: "От 5000₽" },
];

const testimonials = [
  { text: "Лучшее решение в моей жизни. Эффект виден уже через пару процедур!", author: "Анна С." },
  { text: "Очень бережно и профессионально.", author: "Мария К." },
  { text: "Лазер не помогал, а электроэпиляция справилась на 100%.", author: "Елена В." },
];

const timeSlots = ["10:00", "12:00", "14:00", "16:00", "18:00", "20:00"];

export default function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [isDark, setIsDark] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationText, setNotificationText] = useState("");
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

  const toggleTheme = () => setIsDark(!isDark);

  const scrollToBooking = (serviceId?: string) => {
    if (serviceId) {
      setActiveServiceId(serviceId);
    }
    const element = document.getElementById("booking-section");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleBooking = async (message: string) => {
    setNotificationText("Запись отправлена мастеру!");
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 4000);

    try {
      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: `🔔 Новая запись!\n${message}`,
          parse_mode: "Markdown"
        }),
      });
    } catch (e) {
      console.error("Ошибка при отправке в Telegram:", e);
    }
  };

  return (
    <>
      {showIntro && <IntroLoader onComplete={() => setShowIntro(false)} />}
      <div className={`min-h-screen relative transition-colors duration-1000 ${isDark ? "bg-[#0a0a0a] text-white" : "bg-[#fdf5f2] text-slate-900"}`}>
        
        {/* ГЛОБАЛЬНЫЙ ФОН */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className={`absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full blur-[160px] opacity-25 transition-colors duration-1000 ${isDark ? "bg-purple-600" : "bg-pink-300"}`} />
          <div className={`absolute -top-20 -right-40 w-[650px] h-[650px] rounded-full blur-[160px] opacity-25 transition-colors duration-1000 ${isDark ? "bg-pink-500" : "bg-purple-400"}`} />
        </div>

        {/* ШАПКА В ВИДЕ ПАРЯЩЕЙ КАРТОЧКИ */}
        <header className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-auto min-w-[200px] max-w-[90%]">
          <div className={`px-5 py-2.5 rounded-full border flex items-center justify-between gap-10 transition-all duration-1000 backdrop-blur-md shadow-lg ${
            isDark 
              ? "bg-white/5 border-white/10 shadow-black/40" 
              : "bg-white/40 border-black/5 shadow-slate-200/50"
          }`}>
            
            {/* КРУГ-ПРОГРЕСС С КРАСНЫМ ЗАПОЛНЕНИЕМ */}
            <div className="flex items-center justify-center relative w-9 h-9">
              <svg className="-rotate-90 w-full h-full" viewBox="0 0 32 32">
                {/* Полупрозрачная подложка круга */}
                <circle
                  cx="16"
                  cy="16"
                  r={radius}
                  className={isDark ? "stroke-white/10" : "stroke-black/5"}
                  strokeWidth="2.5"
                  fill="transparent"
                />
                {/* Активный круг, заполняющийся ярко-красным (алыми) цветом */}
                <motion.circle
                  cx="16"
                  cy="16"
                  r={radius}
                  className="stroke-red-500"
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
              className={`p-2 rounded-full border transition-all duration-500 hover:scale-105 active:scale-95 ${
                isDark 
                  ? "border-white/10 bg-white/5 hover:bg-white/10" 
                  : "border-black/5 bg-black/5 hover:bg-black/10"
              }`}
            >
              {isDark ? <IconSun className="text-yellow-400 w-4 h-4" /> : <IconMoon className="text-slate-700 w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* КОНТЕНТ */}
        <main className="relative pt-32 pb-20 px-6 max-w-[1440px] mx-auto z-10">
          
          {/* HERO СЕКЦИЯ */}
          <section className="flex flex-col lg:flex-row items-center justify-between gap-12 mb-32 relative">
            <div className="flex-1 text-center lg:text-left z-10">
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight mb-6">
                Ваш путь к <br />
                <span className={`italic ${isDark ? "text-pink-400" : "text-purple-600"}`}>
                  идеальной гладкости
                </span>
              </h1>
              <p className="text-lg opacity-70 mb-10 max-w-xl mx-auto lg:mx-0">
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
          <section className="mb-32 relative">
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
              onBooking={handleBooking} 
            />
          </div>

          {/* ОТЗЫВЫ */}
          <section className="mb-32">
            <h2 className="text-4xl font-bold mb-12 text-center">Ощущения клиентов</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[240px]">
              {testimonials.map((t, idx) => (
                <div key={idx} className={`p-10 rounded-[2.5rem] border ${isDark ? "bg-white/5 border-white/10" : "bg-white/70 border-black/5"}`}>
                  <p className="text-lg font-medium">«{t.text}»</p>
                  <span className="text-sm font-bold opacity-60">{t.author}</span>
                </div>
              ))}
            </div>
          </section>
        </main>

        {/* УВЕДОМЛЕНИЯ */}
        <AnimatePresence>
          {showNotification && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed bottom-8 left-1/2 -translate-x-1/2 p-6 bg-pink-400 text-black rounded-3xl font-bold z-50 shadow-2xl">
              {notificationText}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

