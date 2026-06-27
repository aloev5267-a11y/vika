import { useEffect, useMemo, useState } from 'react';
import { adminApi, type AdminBooking } from './adminApi';

interface Props {
  onChange: (msg: string) => void;
}

type Filter = 'upcoming' | 'past' | 'all';

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'upcoming', label: 'Предстоящие' },
  { id: 'past', label: 'Прошедшие' },
  { id: 'all', label: 'Все' },
];

/** Человекочитаемая дата: «пн, 7 июля 2026». */
function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('ru-RU', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function BookingsManager({ onChange }: Props) {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [stats, setStats] = useState({ total: 0, upcoming: 0 });
  const [filter, setFilter] = useState<Filter>('upcoming');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminApi.getBookings();
      setBookings(data.bookings);
      setStats({ total: data.total, upcoming: data.upcoming });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось загрузить записи');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (b: AdminBooking) => {
    if (!confirm(`Отменить запись на ${formatDate(b.date)} в ${b.time}? Слот снова станет свободным.`)) {
      return;
    }
    setDeletingId(b.id);
    try {
      await adminApi.deleteBooking(b.id);
      await load();
      onChange('Запись отменена, слот освобождён');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось отменить запись');
    } finally {
      setDeletingId(null);
    }
  };

  const visible = useMemo(() => {
    if (filter === 'all') return bookings;
    if (filter === 'past') return bookings.filter((b) => b.isPast);
    return bookings.filter((b) => !b.isPast);
  }, [bookings, filter]);

  // Группируем по дате для удобного просмотра расписания.
  const grouped = useMemo(() => {
    const map = new Map<string, AdminBooking[]>();
    for (const b of visible) {
      (map.get(b.date) ?? map.set(b.date, []).get(b.date)!).push(b);
    }
    // Внутри дня сортируем по времени по возрастанию.
    for (const list of map.values()) list.sort((a, z) => a.time.localeCompare(z.time));
    return Array.from(map.entries());
  }, [visible]);

  const digits = (phone: string) => phone.replace(/\D/g, '');

  return (
    <div className="space-y-6">
      {/* СТАТИСТИКА */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <p className="text-xs font-medium text-slate-500">Предстоящие записи</p>
          <p className="text-3xl font-bold mt-1 text-slate-900">{stats.upcoming}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <p className="text-xs font-medium text-slate-500">Всего записей</p>
          <p className="text-3xl font-bold mt-1 text-slate-900">{stats.total}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 col-span-2 sm:col-span-1 flex items-center">
          <button
            onClick={load}
            className="px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 font-medium text-sm transition-colors w-full"
          >
            Обновить список
          </button>
        </div>
      </div>

      {/* ФИЛЬТРЫ */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f.id ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 hover:bg-slate-100'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* СПИСОК */}
      {loading ? (
        <p className="text-sm text-slate-400">Загрузка…</p>
      ) : grouped.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-400">
          {filter === 'upcoming' ? 'Предстоящих записей пока нет.' : 'Записей не найдено.'}
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(([date, list]) => (
            <div key={date} className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <span className="font-semibold text-sm capitalize">{formatDate(date)}</span>
                <span className="text-xs text-slate-400">{list.length} зап.</span>
              </div>
              <ul className="divide-y divide-slate-100">
                {list.map((b) => (
                  <li
                    key={b.id}
                    className={`px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 ${
                      b.isPast ? 'opacity-60' : ''
                    }`}
                  >
                    <span className="font-mono font-bold text-lg text-slate-900 w-16 shrink-0">{b.time}</span>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 truncate">{b.serviceTitle}</p>
                      <a href={`tel:+${digits(b.phone)}`} className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
                        {b.phone}
                      </a>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={`https://t.me/+${digits(b.phone)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-sky-50 text-sky-600 hover:bg-sky-100 transition-colors"
                      >
                        Telegram
                      </a>
                      <a
                        href={`https://wa.me/${digits(b.phone)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                      >
                        WhatsApp
                      </a>
                      <button
                        onClick={() => handleDelete(b)}
                        disabled={deletingId === b.id}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50 transition-colors"
                      >
                        {deletingId === b.id ? '…' : 'Отменить'}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
