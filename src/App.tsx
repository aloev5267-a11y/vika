import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import IntroLoader from "./components/IntroLoader";
import Header from "./components/Header";
import Hero from "./components/Hero";
import BookingSection from "./components/BookingSection";
import ServicesSection from "./components/ServicesSection";
import AboutSection from "./components/AboutSection";
import ExperienceSection from "./components/ExperienceSection";
import GallerySection from "./components/GallerySection";
import FaqSection from "./components/FaqSection";
import TestimonialsSection from "./components/TestimonialsSection";
import ContactSection from "./components/ContactSection";
import AdminPage from "./admin/AdminPage";
import { services, timeSlots } from "./lib/data";
import { useContent, INSTAGRAM_URL, INSTAGRAM_HANDLE } from "./lib/content";
import { IconInstagram } from "./components/icons";

type Notification = { text: string; type: "success" | "error" };

export default function App() {
  // Простой роутер: /admin открывает админ-панель.
  const [path, setPath] = useState(window.location.pathname);
  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  if (path.startsWith("/admin")) {
    return <AdminPage />;
  }

  return <LandingPage />;
}

function LandingPage() {
  const [showIntro, setShowIntro] = useState(true);
  const [isDark, setIsDark] = useState(true);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [activeServiceId, setActiveServiceId] = useState(services[0].id);
  const [scrollProgress, setScrollProgress] = useState(0);

  const { content } = useContent();

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        setScrollProgress((window.scrollY / totalScroll) * 100);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => setIsDark((prev) => !prev);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const scrollToBooking = (serviceId?: string) => {
    if (serviceId) setActiveServiceId(serviceId);
    scrollToSection("booking-section");
  };

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

        <Header
          isDark={isDark}
          toggleTheme={toggleTheme}
          scrollProgress={scrollProgress}
          scrollToSection={scrollToSection}
          scrollToBooking={() => scrollToBooking()}
          phone={content.settings.phone}
        />

        <main className="relative pt-32 pb-20 px-6 max-w-[1280px] mx-auto z-10">
          <Hero isDark={isDark} scrollToBooking={() => scrollToBooking()} beforeAfter={content.beforeAfter} />

          {/* УСЛУГИ */}
          <ServicesSection isDark={isDark} services={services} scrollToBooking={scrollToBooking} />

          <ExperienceSection isDark={isDark} advantages={content.advantages} />

          {/* БРОНИРОВАНИЕ */}
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

          <GallerySection isDark={isDark} items={content.beforeAfter} />

          <AboutSection isDark={isDark} settings={content.settings} />

          <FaqSection isDark={isDark} />

          <TestimonialsSection isDark={isDark} testimonials={content.testimonials} />

          <ContactSection isDark={isDark} settings={content.settings} />
        </main>

        {/* ФУТЕР */}
        <footer className={`relative z-10 border-t py-8 px-6 flex flex-col items-center gap-3 text-center text-sm ${isDark ? "border-white/10 text-white/50" : "border-black/5 text-slate-500"}`}>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 font-medium transition-opacity hover:opacity-80 ${isDark ? "text-pink-400" : "text-purple-600"}`}
          >
            <IconInstagram className="w-4 h-4" />
            @{INSTAGRAM_HANDLE}
          </a>
          <p>© {new Date().getFullYear()} Виктория · Электроэпиляция в Минске · Все зоны 40 BYN</p>
        </footer>

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
