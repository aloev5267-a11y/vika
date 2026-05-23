"use client";

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";

export default function IntroLoader({ onComplete }: { onComplete: () => void }) {
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Через 2.8 секунды запускаем плавное растворение всего экрана интро
    const leaveTimer = setTimeout(() => {
      setIsLeaving(true);
    }, 2800);

    // Через 3.8 секунды полностью удаляем лоадер из DOM
    const destroyTimer = setTimeout(() => {
      onComplete();
    }, 3800);

    return () => {
      clearTimeout(leaveTimer);
      clearTimeout(destroyTimer);
    };
  }, [onComplete]);

  // Разбираем слово на массив букв
  const word = ["Н", "Е", "У", "Д", "О", "Б", "С", "Т", "В", "А"];

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={isLeaving ? { opacity: 0 } : { opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0a0a0a] text-white select-none pointer-events-none p-4"
    >
      <div className="text-center font-mono uppercase">
        
        {/* Строка 1: ЗАБУДЬ О СЛОВЕ */}
        <h2 className="text-xl sm:text-2xl md:text-4xl font-light tracking-[0.2em] mb-6 opacity-90">
          Забудь о слове
        </h2>

        {/* Строка 2: НЕУДОБСТВА */}
        <div className="text-3xl sm:text-5xl md:text-7xl font-bold tracking-[0.1em] flex justify-center gap-[0.15em]">
          {word.map((letter, index) => {
            // Расчет задержки для исчезновения справа налево (с конца слова):
            const delay = 0.4 + (word.length - 1 - index) * 0.1;

            return (
              <motion.span
                key={index}
                // ИСПРАВЛЕНО: перенесли display="inline-block" в Tailwind CSS класс className
                className="inline-block"
                initial={{ opacity: 1, scale: 1 }}
                animate={{ opacity: 0, scale: 0.9 }}
                transition={{
                  delay: delay,
                  duration: 0.25,
                  ease: "easeInOut",
                }}
              >
                {letter}
              </motion.span>
            );
          })}
        </div>

      </div>
    </motion.div>
  );
}