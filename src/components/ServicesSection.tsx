"use client";

import React from "react";
import { motion } from "motion/react";

// Документация: Описание структуры данных для одной карточки услуги
interface ServiceCardProps {
  title: string;       // Название зоны (например, "Лицо")
  description: string; // Описание процедуры
  price: string;       // Цена (например, "от 1500₽")
  isDark: boolean;     // Флаг темной темы для смены стилей
}

// Компонент одной карточки с исправленной структурой слоев
function ServiceCard({ title, description, price, isDark }: ServiceCardProps) {
  return (
    <div 
      className={`p-5 md:p-6 rounded-[2rem] border backdrop-blur-md flex flex-col justify-between h-full min-h-[320px] transition-all duration-300 ${
        isDark 
          ? "bg-black/30 border-white/10 text-white" 
          : "bg-white/10 border-white/20 text-slate-900"
      }`}
    >
      {/* ВЕРХНЯЯ ЧАСТЬ: Название и описание */}
      <div className="space-y-3">
        {/* Декоративная линия сверху, как на макете */}
        <div className={`w-10 h-1 rounded-full ${isDark ? "bg-white/20" : "bg-black/20"}`} />
        
        <h3 className="text-xl font-bold tracking-tight mt-2">{title}</h3>
        <p className="text-sm opacity-70 leading-relaxed max-w-[200px] sm:max-w-none">
          {description}
        </p>
      </div>

      {/* НИЖНЯЯ ЧАСТЬ: Контейнер для цены и кнопки (исправляет баг наложения) */}
      <div className="mt-6 pt-4 border-t border-dashed border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Цена */}
        <div className="flex flex-col">
          <span className="text-[10px] uppercase opacity-40 font-semibold tracking-wider">Стоимость</span>
          <span className="text-lg font-mono font-bold tracking-tight whitespace-nowrap">
            {price}
          </span>
        </div>

        {/* Розовая интерактивная кнопка */}
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          type="button"
          className="px-5 py-2.5 rounded-full bg-[#ff00ff] text-white text-xs font-bold shadow-[0_0_15px_rgba(255,0,255,0.3)] hover:bg-[#e000e0] transition-colors whitespace-nowrap text-center"
        >
          Записаться
        </motion.button>
      </div>
    </div>
  );
}

// Главный компонент секции "Наши услуги"
export default function ServicesSection({ isDark = true }: { isDark?: boolean }) {
  // Тестовые данные, в точности повторяющие карточки с изображения image_3609a3.png
  const servicesData = [
    { id: "1", title: "Лицо", description: "Удаление волос над губой, подбородке и щеках.", price: "От 1500₽" },
    { id: "2", title: "Тело", description: "Руки, ноги, спина. Полная гладкость навсегда.", price: "От 3000₽" },
    { id: "3", title: "Бикини", description: "Деликатные зоны. Комфорт и гигиена.", price: "От 2500₽" },
    { id: "4", title: "Ноги полностью", description: "Безупречный результат для ваших ног.", price: "От 5000₽" },
  ];

  return (
    <section className="py-12 px-4 max-w-7xl mx-auto">
      {/* Заголовок секции */}
      <div className="mb-8">
        <span className="text-xs font-bold uppercase tracking-widest text-[#ff00ff] block mb-1">ELECTROEPIL</span>
        <h2 className="text-3xl md:text-4xl font-display font-bold text-white">Наши услуги</h2>
      </div>

      {/* Адаптивная сетка карточек */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {servicesData.map((service) => (
          <ServiceCard
            key={service.id}
            title={service.title}
            description={service.description}
            price={service.price}
            isDark={isDark}
          />
        ))}
      </div>
    </section>
  );
}