"use client";

import React from "react";
import { motion } from "motion/react";

interface ServiceCardProps {
  title: string;
  description: string;
  price: string;
  isDark: boolean;
}

function ServiceCard({ title, description, price, isDark }: ServiceCardProps) {
  return (
    <div 
      className={`p-6 rounded-[2rem] border backdrop-blur-md flex flex-col justify-between h-full min-h-[350px] w-full sm:w-auto snap-start transition-all duration-300 ${
        isDark 
          ? "bg-black/30 border-white/10 text-white" 
          : "bg-white/10 border-white/20 text-slate-900"
      }`}
    >
      {/* ВЕРХНЯЯ ЧАСТЬ */}
      <div className="space-y-3">
        <div className={`w-10 h-1 rounded-full ${isDark ? "bg-white/20" : "bg-black/20"}`} />
        <h3 className="text-xl font-bold tracking-tight mt-2">{title}</h3>
        <p className="text-sm opacity-70 leading-relaxed">
          {description}
        </p>
      </div>

      {/* НИЖНЯЯ ЧАСТЬ: Цена по центру, кнопка строго под ней */}
      <div className="mt-6 pt-4 border-t border-dashed border-white/10 flex flex-col items-center text-center gap-4 w-full">
        
        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase opacity-40 font-semibold tracking-wider">Стоимость</span>
          <span className="text-lg font-mono font-bold tracking-tight whitespace-nowrap">
            {price}
          </span>
        </div>

        {/* Интерактивная кнопка записи */}
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          type="button"
          onClick={() => document.getElementById("booking-section")?.scrollIntoView({ behavior: "smooth" })}
          className="w-full max-w-[150px] px-4 py-2.5 rounded-full bg-[#ff00ff] text-white text-xs font-bold shadow-[0_0_15px_rgba(255,0,255,0.3)] hover:bg-[#e000e0] transition-colors text-center"
        >
          Записаться →
        </motion.button>
        
      </div>
    </div>
  );
}

export default function ServicesSection({ isDark = true }: { isDark?: boolean }) {
  // ИСПРАВЛЕНО: ID заменены на числовые строки для полной синхронизации с App.tsx
  const servicesData = [
    { id: "1", title: "Лицо", description: "Удаление волос над губой, подбородке и щеках.", price: "От 1500₽" },
    { id: "2", title: "Тело", description: "Руки, ноги, спина. Полная гладкость навсегда.", price: "От 3000₽" },
    { id: "3", title: "Бикини", description: "Деликатные зоны. Комфорт и гигиена.", price: "От 2500₽" },
    { id: "4", title: "Ноги полностью", description: "Безупречный результат для ваших ног.", price: "От 5000₽" },
  ];

  return (
    <section className="py-12 px-2 max-w-7xl mx-auto">
      <div className="mb-8">
        <span className="text-xs font-bold uppercase tracking-widest text-[#ff00ff] block mb-1">ELECTROEPIL</span>
        <h2 className="text-3xl md:text-4xl font-bold text-white">Наши услуги</h2>
      </div>

      {/* Пуленепробиваемый контейнер сетки: на телефонах/горизонтальных смартфонах активируется красивый свайп-скролл, ничего не сжимается */}
      <div className="flex overflow-x-auto md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 pb-4 snap-x scrollbar-none">
        {servicesData.map((service) => (
          <div key={service.id} className="min-w-[260px] flex-shrink-0 md:min-w-0 w-[280px] md:w-auto">
            <ServiceCard
              title={service.title}
              description={service.description}
              price={service.price}
              isDark={isDark}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

