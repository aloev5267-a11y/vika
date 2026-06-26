// Общие SVG-иконки. Брендовые иконки мессенджеров — собственные пути,
// так как lucide-react не содержит брендовых логотипов.

type IconProps = { className?: string };

export const IconMoon = ({ className }: IconProps) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconSun = ({ className }: IconProps) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const IconArrowRight = ({ className }: IconProps) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconPhone = ({ className }: IconProps) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.13.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0122 16.92z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Telegram
export const IconTelegram = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <path d="M21.94 4.6l-3.32 15.67c-.25 1.1-.9 1.38-1.83.86l-5.05-3.72-2.44 2.35c-.27.27-.5.5-1.02.5l.36-5.14L18 5.9c.4-.36-.09-.56-.62-.2L6.1 13.06l-4.98-1.56c-1.08-.34-1.1-1.08.23-1.6l19.46-7.5c.9-.34 1.69.2 1.4 1.6.01-.13 0 0 0 0z" />
  </svg>
);

// WhatsApp
export const IconWhatsApp = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <path d="M17.47 14.38c-.3-.15-1.74-.86-2-.95-.27-.1-.46-.15-.66.15-.2.3-.76.95-.93 1.14-.17.2-.34.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.05-.17-.3-.02-.46.13-.6.13-.14.3-.34.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.66-1.6-.9-2.18-.24-.57-.48-.5-.66-.5h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.63.71.23 1.36.2 1.87.12.57-.08 1.74-.71 1.98-1.4.25-.68.25-1.27.18-1.39-.07-.12-.27-.2-.57-.34zM12.04 21.5h-.01a9.45 9.45 0 01-4.8-1.32l-.34-.2-3.56.93.95-3.47-.22-.36a9.43 9.43 0 01-1.45-5.05c0-5.22 4.25-9.47 9.48-9.47 2.53 0 4.9.99 6.69 2.78a9.41 9.41 0 012.77 6.7c0 5.22-4.25 9.46-9.48 9.46zm8.06-17.52A11.36 11.36 0 0012.04.5C5.76.5.65 5.6.65 11.88c0 2.08.54 4.1 1.58 5.9L.55 23.5l5.86-1.54a11.34 11.34 0 005.62 1.43h.01c6.28 0 11.39-5.1 11.39-11.38 0-3.04-1.18-5.9-3.33-8.05z" />
  </svg>
);

// Viber
export const IconViber = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <path d="M11.4.04C9.47.07 5.32.39 3 2.53 1.27 4.24.66 6.78.6 9.92c-.07 3.13-.15 9 5.5 10.6v2.43s-.04.98.6 1.18c.79.24 1.25-.5 2-1.31l1.41-1.6c3.86.32 6.83-.42 7.17-.53.78-.25 5.2-.82 5.92-6.69.74-6.05-.36-9.87-2.34-11.6C20.2.96 17.6.04 14.9.04c0 0-.43-.03-1.04-.03-.74 0-1.62.03-2.46.03zm.1 1.7c.71-.01 1.5-.02 2.18-.02 2.3 0 4.5.78 4.96 1.16 1.67 1.45 2.53 4.88 1.9 9.94-.6 4.9-4.19 5.3-4.85 5.51-.28.09-2.9.74-6.23.52l-1.66 1.93-.7.83c-.1.12-.22.16-.3.13-.12-.03-.15-.16-.15-.36l.02-3.18c-4.78-1.32-4.5-6.32-4.45-8.95.05-2.62.55-4.74 2-6.16C7.4 2.04 10.93 1.78 12.5 1.75zm.43 2.84a.4.4 0 00-.07.81c2.85.21 4.22 1.62 4.4 4.62a.4.4 0 00.43.38.4.4 0 00.38-.43c-.2-3.4-1.87-5.16-5.15-5.4a.4.4 0 00-.06 0zm-3.96.85a.65.65 0 00-.42.07l-.02.01c-.4.24-.77.55-1.06.93-.27.34-.42.68-.46.99-.02.18 0 .37.06.55l.02.01c.18.5.6 1.34 1.49 2.6.57.82 1.04 1.4 1.4 1.81.01.02.16.18.18.2.07.07.16.16.27.27.42.41 1 .88 1.8 1.45 1.27.9 2.1 1.31 2.6 1.5h.01c.18.06.37.08.55.06.31-.04.65-.19.99-.46.38-.29.69-.65.92-1.06l.01-.01a.65.65 0 00-.16-.83c-.5-.42-1.06-.8-1.62-1.13-.38-.21-.76-.09-.92.12l-.33.42c-.17.21-.48.18-.48.18l-.01.01c-2.3-.59-2.92-2.92-2.92-2.92s-.03-.31.18-.48l.42-.33c.21-.16.33-.54.12-.92-.33-.56-.71-1.12-1.13-1.62a.65.65 0 00-.4-.23zm4.1.65a.4.4 0 00-.05.8c1.4.2 2.07.9 2.25 2.35a.4.4 0 00.44.35.4.4 0 00.35-.45c-.22-1.78-1.18-2.79-2.92-3.04a.4.4 0 00-.07-.01zm.17 1.74a.4.4 0 00-.1.8c.48.1.65.27.74.74a.4.4 0 10.78-.16c-.16-.78-.62-1.24-1.36-1.38a.4.4 0 00-.06 0z" />
  </svg>
);

// Иконки для преимуществ / процедуры
export const IconInfinity = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <path d="M18.18 8c-1.84 0-3.34 1.5-4.18 4-.84-2.5-2.34-4-4.18-4A4.18 4.18 0 005.64 12a4.18 4.18 0 004.18 4c1.84 0 3.34-1.5 4.18-4 .84 2.5 2.34 4 4.18 4A4.18 4.18 0 0022.36 12a4.18 4.18 0 00-4.18-4z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconShield = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconHeart = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconAward = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <circle cx="12" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
    <path d="M15.48 12.94L17 22l-5-3-5 3 1.52-9.06" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconSparkles = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconMapPin = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

export const IconChevronDown = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Карта иконок преимуществ по строковому ключу (используется и в админке).
export const advantageIcons: Record<string, (p: IconProps) => JSX.Element> = {
  infinity: IconInfinity,
  shield: IconShield,
  heart: IconHeart,
  award: IconAward,
  sparkles: IconSparkles,
};
