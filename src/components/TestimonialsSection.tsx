"use client";

import React from "react";

interface Testimonial {
  text: string;
  author: string;
}

interface TestimonialsSectionProps {
  isDark: boolean;
}

export default function TestimonialsSection({ isDark }: TestimonialsSectionProps) {
  const testimonials: Testimonial[] = [
    { text: "Результат превзошел ожидания. Забыла про бритву!", author: "Анна К." },
    { text: "Очень бережное отношение и стерильность на высшем уровне.", author: "Мария С." },
    { text: "Эффект виден уже после первых процедур. Рекомендую всем.", author: "Ольга Д." },
  ];

  return (
    <section className="mb-32">
      <h2 className="text-4xl font-bold mb-12 text-center">Ощущения клиентов</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[240px]">
        {testimonials.map((t, idx) => (
          <div 
            key={idx} 
            className={`p-10 rounded-[2.5rem] border transition-colors duration-500 flex flex-col justify-between ${
              isDark 
                ? "bg-white/5 border-white/10 text-white" 
                : "bg-white/70 border-black/5 text-slate-900"
            }`}
          >
            <p className="text-lg font-medium leading-relaxed">«{t.text}»</p>
            <span className="text-sm font-bold opacity-60 mt-4">— {t.author}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

