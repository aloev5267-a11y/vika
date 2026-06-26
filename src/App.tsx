import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import IntroLoader from "./components/IntroLoader";
import Header from "./components/Header";
import Hero from "./components/Hero";
import BookingSection from "./components/BookingSection";
import AboutSection from "./components/AboutSection";
import ProcessSection from "./components/ProcessSection";
import AdvantagesSection from "./components/AdvantagesSection";
import GallerySection from "./components/GallerySection";
import FaqSection from "./components/FaqSection";
import TestimonialsSection from "./components/TestimonialsSection";
import ContactSection from "./components/ContactSection";
import AdminPage from "./admin/AdminPage";
import { services, timeSlots } from "./lib/data";
import { useContent } from "./lib/content";
import { IconArrowRight } from "./components/icons";

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
          <section id="services-section" className="mb-32 relative scroll-mt-28">
            <h2 className="text-4xl font-bold mb-12 text-balance">Наши услуги</h2>
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

          <AdvantagesSection isDark={isDark} advantages={content.advantages} />

          <ProcessSection isDark={isDark} />

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
        <footer className={`relative z-10 border-t py-8 px-6 text-center text-sm ${isDark ? "border-white/10 text-white/50" : "border-black/5 text-slate-500"}`}>
          <p>© {new Date().getFullYear()} Lumière · Электроэпиляция в Минске · Все зоны 40 BYN</p>
          <a href="/admin" className="inline-block mt-2 opacity-60 hover:opacity-100 transition-opacity">Вход для администратора</a>
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
