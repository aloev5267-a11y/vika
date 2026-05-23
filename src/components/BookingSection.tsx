"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";

interface BookingSectionProps {
  isDark: boolean;
  services: { id: string; title: string; price: string; desc?: string }[];
  timeSlots: string[];
  selectedServiceId: string; // Оставляем для обратной совместимости, если нужно
  onServiceChange: (id: string) => void;
  onBooking: (message: string) => void;
}

export default function BookingSection({ 
  isDark, 
  services, 
  timeSlots, 
  onBooking 
}: BookingSectionProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState("");
  const [phone, setPhone] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Множественный выбор: храним массив ID выбранных услуг (по умолчанию выбрана первая)
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([services[0].id]);

  // Календарная логика: генерация первых 11 дней для быстрой сетки
  const quickDays = useMemo(() => {
    const dates = [];
    for (let i = 0; i < 11; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      dates.push(d);
    }
    return dates;
  }, []);

  // Генерация дней для встроенного мини-календаря в модальном окне (ближайшие 60 дней)
  const modalMonths = useMemo(() => {
    const today = new Date();
    const daysArray = [];
    for (let i = 0; i < 60; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      daysArray.push(d);
    }
    return daysArray;
  }, []);

  // Переключение выбора услуги (добавление / удаление из массива)
  const handleServiceToggle = (id: string) => {
    setSelectedServiceIds((prev) => {
      if (prev.includes(id)) {
        // Не позволяем деактивировать всё, должен остаться хотя бы один выбор
        if (prev.length === 1) return prev;
        return prev.filter((serviceId) => serviceId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Получаем массив объектов всех выбранных услуг
  const selectedServices = useMemo(() => {
    return services.filter((s) => selectedServiceIds.includes(s.id));
  }, [services, selectedServiceIds]);

  // Автоматический подсчет итоговой суммы сеанса
  const totalPrice = useMemo(() => {
    return selectedServices.reduce((sum, service) => {
      // Извлекаем только цифры из строки цены (например, "От 1500₽" -> 1500)
      const priceDigits = parseInt(service.price.replace(/\D/g, ""), 10) || 0;
      return sum + priceDigits;
    }, 0);
  }, [selectedServices]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTime) {
      alert("Пожалуйста, выберите время для записи.");
      return;
    }
    
    const formattedDate = selectedDate.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
    const zonesTitles = selectedServices.map(s => s.title).join(", ");
    
    const message = `✨ Услуги: *${zonesTitles}*\n📅 Дата: *${formattedDate}*\n⏰ Время: *${selectedTime}*\n💰 Итоговая сумма: *${totalPrice}₽*\n📱 Телефон: \`${phone}\``;
    onBooking(message);
  };

  // Проверка, совпадает ли дата из списка с выбранной
  const isSameDay = (date1: Date, date2: Date) => {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };

  return (
    <section className="mb-32 relative">
      <div className={`absolute inset-0 rounded-[3rem] blur-[100px] opacity-5 pointer-events-none ${isDark ? "bg-pink-500" : "bg-purple-500"}`} />

      <div className={`relative p-6 md:p-10 rounded-[3rem] border backdrop-blur-xl transition-all duration-500 ${isDark ? "bg-black/40 border-white/10" : "bg-white/60 border-black/5 shadow-2xl"}`}>
        
        {/* Заголовок */}
        <div className="mb-10 text-center md:text-left">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Запись на сеанс</h2>
          <p className="text-sm opacity-60">Выберите удобные параметры ниже (можно выбрать несколько зон)</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* ЛЕВАЯ ЧАСТЬ */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Выбор зоны (Множественный выбор) */}
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider opacity-50 mb-3">1. Выберите одну или несколько зон</span>
              <div className="flex flex-wrap gap-2">
                {services.map((s) => {
                  const isSelected = selectedServiceIds.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleServiceToggle(s.id)}
                      className={`px-5 py-3 rounded-2xl border text-sm font-medium transition-all ${
                        isSelected 
                          ? (isDark ? "bg-pink-500/10 border-pink-400 text-pink-400 shadow-[0_0_15px_rgba(244,143,177,0.15)]" : "bg-purple-600 text-white border-purple-600")
                          : (isDark ? "bg-white/5 border-white/5 text-white/70 hover:bg-white/10" : "bg-black/5 border-transparent text-slate-700 hover:bg-black/10")
                      }`}
                    >
                      {isSelected && <span className="mr-1.5 font-bold">✓</span>}
                      {s.title} — {s.price}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Компактная сетка дат */}
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider opacity-50 mb-3">2. Дата визита</span>
              <div className="grid grid-cols-4 gap-2">
                {quickDays.map((date, idx) => {
                  const isSelected = isSameDay(selectedDate, date);
                  const label = idx === 0 ? "Сегодня" : idx === 1 ? "Завтра" : date.toLocaleDateString("ru-RU", { day: "numeric" });
                  const weekday = date.toLocaleDateString("ru-RU", { weekday: "short" });
                  const month = date.toLocaleDateString("ru-RU", { month: "short" });

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedDate(date)}
                      className={`h-20 rounded-2xl border flex flex-col items-center justify-center transition-all ${
                        isSelected 
                          ? (isDark ? "bg-pink-400 text-black border-pink-400 font-bold" : "bg-slate-900 text-white border-slate-900 font-bold") 
                          : (isDark ? "bg-white/5 border-white/5 text-white/60 hover:bg-white/10" : "bg-black/5 border-transparent text-slate-700 hover:bg-black/10")
                      }`}
                    >
                      <span className="text-[9px] uppercase opacity-60 font-medium mb-0.5">{weekday}</span>
                      <span className="text-base font-bold tracking-tight">{label}</span>
                      <span className="text-[9px] opacity-60 lowercase mt-0.5">{month}</span>
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className={`h-20 rounded-2xl border border-dashed flex flex-col items-center justify-center transition-all ${
                    isDark 
                      ? "border-pink-400/40 text-pink-400 hover:bg-pink-400/10 hover:border-pink-400" 
                      : "border-purple-600/40 text-purple-600 hover:bg-purple-600/5 hover:border-purple-600"
                  }`}
                >
                  <span className="text-xs font-bold text-center px-1 leading-tight">Показать больше</span>
                </button>
              </div>
            </div>

            {/* Доступное время */}
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider opacity-50 mb-3">3. Доступное время</span>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {timeSlots.map((time) => {
                  const isSelected = selectedTime === time;
                  return (
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      key={time}
                      type="button"
                      onClick={() => setSelectedTime(time)}
                      className={`py-3.5 rounded-xl border text-center font-mono text-sm font-semibold transition-all ${
                        isSelected
                          ? (isDark ? "bg-pink-400 text-black border-pink-400" : "bg-slate-900 text-white border-slate-900")
                          : (isDark ? "bg-white/5 border-white/10 text-white hover:bg-white/10" : "bg-white border-black/10 text-slate-800 hover:bg-black/5")
                      }`}
                    >
                      {time}
                    </motion.button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* ПРАВАЯ ЧАСТЬ: ИТОГОВАЯ КАРТОЧКА С ДИНАМИЧЕСКИМ СЧЕТЧИКОМ */}
          <div className="flex flex-col justify-between">
            <div className={`p-6 rounded-3xl border flex flex-col justify-between h-full ${isDark ? "bg-white/[0.02] border-white/5" : "bg-black/[0.02] border-black/5"}`}>
              <div className="space-y-4">
                <span className="block text-xs font-bold uppercase tracking-wider opacity-50">Ваша запись</span>
                <div className="space-y-3">
                  
                  {/* Вывод выбранных зон (выводит столько элементов, сколько кнопок выбрано) */}
                  <div className="flex flex-col gap-1.5 border-b border-dashed border-white/10 pb-3">
                    <span className="text-xs opacity-50 font-bold uppercase tracking-wide">Выбранные зоны:</span>
                    <div className="flex flex-col gap-1">
                      {selectedServices.map((service) => (
                        <div key={service.id} className="flex justify-between items-center text-sm">
                          <span className="font-semibold opacity-90">· {service.title}</span>
                          <span className="font-mono text-xs opacity-60">{service.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-baseline">
                    <span className="text-sm opacity-70">Дата:</span>
                    <span className="font-medium text-right">
                      {selectedDate.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm opacity-70">Время:</span>
                    <span className={`font-mono font-bold text-lg ${isDark ? "text-pink-400" : "text-purple-600"}`}>
                      {selectedTime || "не выбрано"}
                    </span>
                  </div>
                </div>

                {/* Автоматический подсчет итоговой суммы сеанса */}
                <div className="pt-3 border-t border-dashed border-white/10 flex justify-between items-center">
                  <span className="text-sm font-bold">Итоговая сумма:</span>
                  <span className={`text-xl font-mono font-bold ${isDark ? "text-pink-400" : "text-purple-600"}`}>
                    ~ {totalPrice} ₽
                  </span>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider opacity-50 mb-2">Контактный телефон</label>
                  <input 
                    type="tel" 
                    required 
                    placeholder="+375 ( )" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                    className={`w-full p-4 rounded-xl border text-sm ${
                      isDark 
                        ? "bg-zinc-900 border-white/10 text-white focus:border-pink-400" 
                        : "bg-white border-black/10 text-slate-950 focus:border-slate-900"
                    } outline-none transition-colors`}
                  />
                </div>
                
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit" 
                  className={`w-full p-4 rounded-xl font-bold text-sm transition-all shadow-lg ${
                    isDark 
                      ? "bg-pink-400 text-black hover:bg-pink-300 shadow-pink-500/10" 
                      : "bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/10"
                  }`}
                >
                  Подтвердить визит
                </motion.button>
              </div>
            </div>
          </div>

        </form>
      </div>

      {/* АНИМИРОВАННОЕ МОДАЛЬНОЕ ОКНО КАЛЕНДАРЯ */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className={`relative w-full max-w-md p-6 rounded-[2.5rem] border shadow-2xl overflow-hidden ${
                isDark ? "bg-[#121212] border-white/10 text-white" : "bg-white border-black/5 text-slate-950"
              }`}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Выбор дальней даты</h3>
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center border border-white/10 opacity-70 hover:opacity-100 transition-opacity"
                >
                  ✕
                </button>
              </div>

              <div className="max-h-[350px] overflow-y-auto pr-2 space-y-6 custom-glass-scroll">
                <div className="grid grid-cols-4 gap-2">
                  {modalMonths.map((date, idx) => {
                    const isSelected = isSameDay(selectedDate, date);
                    const label = date.getDate();
                    const weekday = date.toLocaleDateString("ru-RU", { weekday: "short" });
                    const month = date.toLocaleDateString("ru-RU", { month: "short" });

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setSelectedDate(date);
                          setIsModalOpen(false);
                        }}
                        className={`p-3 rounded-xl border flex flex-col items-center justify-center transition-all ${
                          isSelected 
                            ? (isDark ? "bg-pink-400 text-black font-bold shadow-[0_0_15px_rgba(244,143,177,0.4)]" : "bg-slate-900 text-white font-bold") 
                            : (isDark ? "bg-white/5 hover:bg-pink-500/20 hover:text-pink-300 text-white/90" : "bg-black/5 hover:bg-purple-600/10 text-slate-800")
                        }`}
                      >
                        <span className="text-[8px] uppercase opacity-50">{weekday}</span>
                        <span className="text-sm font-bold">{label}</span>
                        <span className="text-[8px] opacity-50 lowercase">{month}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 text-center text-xs opacity-50">
                Доступна запись на 60 дней вперед
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}

