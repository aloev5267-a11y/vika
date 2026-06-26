import useSWR from 'swr';
import { apiGet } from './api';

export interface Testimonial {
  id?: number;
  author: string;
  text: string;
}

export interface BeforeAfter {
  id: number;
  title: string;
  imageBefore: string;
  imageAfter: string;
}

export interface Advantage {
  id?: number;
  icon: string;
  title: string;
  description: string;
}

export interface SiteSettings {
  phone: string;
  address: string;
  map_embed: string;
  master_name: string;
  master_experience: string;
  master_bio: string;
  master_photo: string;
  master_certificates: string; // JSON-массив строк
}

export interface SiteContent {
  testimonials: Testimonial[];
  beforeAfter: BeforeAfter[];
  advantages: Advantage[];
  settings: SiteSettings;
}

// Дефолтный контент — используется как fallback, если БД недоступна (например, в превью).
export const DEFAULT_CONTENT: SiteContent = {
  testimonials: [
    { author: 'Анна С.', text: 'Лучшее решение в моей жизни. Эффект виден уже через пару процедур!' },
    { author: 'Мария К.', text: 'Очень бережно и профессионально.' },
    { author: 'Елена В.', text: 'Лазер не помогал, а электроэпиляция справилась на 100%.' },
  ],
  beforeAfter: [],
  advantages: [
    { icon: 'infinity', title: 'Навсегда', description: 'Электроэпиляция — единственный метод удаления волос навсегда.' },
    { icon: 'shield', title: 'Стерильность', description: 'Только одноразовые стерильные иглы и инструменты.' },
    { icon: 'heart', title: 'Бережно', description: 'Индивидуальный подход и комфорт на каждой процедуре.' },
    { icon: 'award', title: 'Опыт', description: 'Сертифицированный мастер с многолетней практикой.' },
  ],
  settings: {
    phone: '+375 33 681 5427',
    address: 'г. Минск, ул. Примерная, 1',
    map_embed: '',
    master_name: 'Мастер Lumière',
    master_experience: 'Более 7 лет опыта в электроэпиляции',
    master_bio:
      'Сертифицированный специалист по электроэпиляции. Индивидуальный подход, стерильные одноразовые инструменты и забота о каждом клиенте.',
    master_photo: '',
    master_certificates: '[]',
  },
};

const fetcher = (path: string) => apiGet<SiteContent>(path);

/** Загружает контент сайта с graceful fallback на дефолты. */
export function useContent() {
  const { data, error, isLoading, mutate } = useSWR<SiteContent>('/api/content', fetcher, {
    fallbackData: DEFAULT_CONTENT,
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  // Сливаем настройки с дефолтами, чтобы недостающие ключи не ломали UI.
  const content: SiteContent = {
    testimonials: data?.testimonials?.length ? data.testimonials : DEFAULT_CONTENT.testimonials,
    beforeAfter: data?.beforeAfter ?? [],
    advantages: data?.advantages?.length ? data.advantages : DEFAULT_CONTENT.advantages,
    settings: { ...DEFAULT_CONTENT.settings, ...(data?.settings ?? {}) },
  };

  return { content, error, isLoading, mutate };
}

/** Телефон в формате для tel: и ссылок мессенджеров (только цифры). */
export function phoneDigits(phone: string): string {
  return phone.replace(/\D/g, '');
}
