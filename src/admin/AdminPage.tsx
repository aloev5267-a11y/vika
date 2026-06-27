import { useEffect, useState } from 'react';
import type { SiteContent } from '../lib/content';
import { DEFAULT_CONTENT } from '../lib/content';
import { adminApi, clearToken, login, verify } from './adminApi';
import LoginForm from './LoginForm';
import BookingsManager from './BookingsManager';
import GalleryManager from './GalleryManager';
import TestimonialsManager from './TestimonialsManager';
import AdvantagesManager from './AdvantagesManager';
import SettingsManager from './SettingsManager';
import TimeSlotsManager from './TimeSlotsManager';

type Tab = 'bookings' | 'gallery' | 'testimonials' | 'advantages' | 'slots' | 'settings';

const TABS: { id: Tab; label: string }[] = [
  { id: 'bookings', label: 'Записи клиентов' },
  { id: 'gallery', label: 'Галерея до/после' },
  { id: 'testimonials', label: 'Отзывы' },
  { id: 'advantages', label: 'Преимущества' },
  { id: 'slots', label: 'Время записи' },
  { id: 'settings', label: 'Настройки сайта' },
];

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [loginError, setLoginError] = useState('');
  const [tab, setTab] = useState<Tab>('bookings');

  const [content, setContent] = useState<SiteContent>(DEFAULT_CONTENT);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    verify().then((ok) => {
      setAuthed(ok);
      setChecking(false);
    });
  }, []);

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getContent();
      setContent({
        testimonials: data.testimonials ?? [],
        beforeAfter: data.beforeAfter ?? [],
        advantages: data.advantages ?? [],
        settings: { ...DEFAULT_CONTENT.settings, ...(data.settings ?? {}) },
      });
    } catch {
      // оставляем дефолты
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authed) refresh();
  }, [authed]);

  const handleLogin = async (password: string) => {
    setLoginError('');
    try {
      await login(password);
      setAuthed(true);
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Ошибка входа');
    }
  };

  const handleLogout = () => {
    clearToken();
    setAuthed(false);
  };

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const afterChange = async (msg: string) => {
    await refresh();
    notify(msg);
  };

  if (checking) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">Загрузка…</div>;
  }

  if (!authed) {
    return <LoginForm onSubmit={handleLogin} error={loginError} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* ШАПКА */}
      <header className="sticky top-0 z-20 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg">Виктория</span>
            <span className="text-sm text-slate-400">Админ-панель</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="/" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
              На сайт
            </a>
            <button
              onClick={handleLogout}
              className="text-sm px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Выйти
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* ВКЛАДКИ */}
        <nav className="flex flex-wrap gap-2 mb-8">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t.id ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        {loading && <p className="text-sm text-slate-400 mb-4">Обновление данных…</p>}

        {tab === 'bookings' && <BookingsManager onChange={notify} />}
        {tab === 'gallery' && <GalleryManager items={content.beforeAfter} onChange={afterChange} />}
        {tab === 'testimonials' && <TestimonialsManager items={content.testimonials} onChange={afterChange} />}
        {tab === 'advantages' && <AdvantagesManager items={content.advantages} onChange={afterChange} />}
        {tab === 'slots' && <TimeSlotsManager onChange={notify} />}
        {tab === 'settings' && <SettingsManager settings={content.settings} onChange={afterChange} />}
      </div>

      {/* ТОСТ */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-lg text-sm z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
