import { useEffect, useState } from 'react';
import { adminApi } from './adminApi';

interface Props {
  onChange: (msg: string) => void;
}

interface Slot {
  id: number;
  time: string;
}

export default function TimeSlotsManager({ onChange }: Props) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [newTime, setNewTime] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getTimeSlots();
      setSlots(data.slots);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось загрузить слоты');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async () => {
    setError('');
    if (!/^\d{2}:\d{2}$/.test(newTime)) {
      setError('Введите время в формате ЧЧ:ММ, например 11:30');
      return;
    }
    try {
      await adminApi.createTimeSlot(newTime);
      setNewTime('');
      await load();
      onChange('Слот времени добавлен');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось добавить слот');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await adminApi.deleteTimeSlot(id);
      await load();
      onChange('Слот времени удалён');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось удалить слот');
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <h2 className="font-semibold mb-1">Доступное время записи</h2>
        <p className="text-sm text-slate-500 mb-4">
          Эти слоты клиенты видят на сайте при выборе времени сеанса. Добавьте или удалите часы под свой график.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <input
            type="time"
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-slate-200 focus:border-slate-900 focus:outline-none w-full sm:w-40"
          />
          <button
            onClick={handleAdd}
            className="px-4 py-2.5 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors whitespace-nowrap"
          >
            Добавить слот
          </button>
        </div>
        {error && <p className="text-sm text-red-500 mt-3">{error}</p>}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <h3 className="font-semibold mb-4">Текущие слоты ({slots.length})</h3>
        {loading ? (
          <p className="text-sm text-slate-400">Загрузка…</p>
        ) : slots.length === 0 ? (
          <p className="text-sm text-slate-400">Слоты не заданы — добавьте хотя бы один, иначе клиенты не смогут записаться.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {slots.map((slot) => (
              <div
                key={slot.id}
                className="flex items-center gap-2 pl-4 pr-2 py-2 rounded-xl bg-slate-100 border border-slate-200"
              >
                <span className="font-mono font-semibold text-sm">{slot.time}</span>
                <button
                  onClick={() => handleDelete(slot.id)}
                  aria-label={`Удалить слот ${slot.time}`}
                  className="w-6 h-6 rounded-md flex items-center justify-center text-slate-400 hover:text-white hover:bg-red-500 transition-colors"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
