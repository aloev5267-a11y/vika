import { useState } from 'react';
import type { Advantage } from '../lib/content';
import { adminApi } from './adminApi';
import { ADVANTAGE_ICON_KEYS } from '../components/icons';

interface Props {
  items: Advantage[];
  onChange: (msg: string) => void;
}

const empty = { icon: 'sparkles', title: '', description: '' };

export default function AdvantagesManager({ items, onChange }: Props) {
  const [draft, setDraft] = useState(empty);
  const [error, setError] = useState('');

  const handleAdd = async () => {
    if (!draft.title || !draft.description) {
      setError('Заполните заголовок и описание');
      return;
    }
    setError('');
    await adminApi.createAdvantage(draft);
    setDraft(empty);
    onChange('Преимущество добавлено');
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;
    await adminApi.deleteAdvantage(id);
    onChange('Преимущество удалено');
  };

  return (
    <div className="space-y-8">
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <h2 className="font-semibold mb-4">Добавить преимущество</h2>
        <div className="grid sm:grid-cols-[160px_1fr] gap-3 mb-3">
          <select
            value={draft.icon}
            onChange={(e) => setDraft((d) => ({ ...d, icon: e.target.value }))}
            className="px-4 py-2.5 rounded-lg border border-slate-200 focus:border-slate-900 focus:outline-none"
          >
            {ADVANTAGE_ICON_KEYS.map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
          <input
            value={draft.title}
            onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
            placeholder="Заголовок"
            className="px-4 py-2.5 rounded-lg border border-slate-200 focus:border-slate-900 focus:outline-none"
          />
        </div>
        <textarea
          value={draft.description}
          onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
          placeholder="Описание"
          rows={2}
          className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-slate-900 focus:outline-none mb-4 resize-none"
        />
        {error && <p className="text-sm text-red-500 mb-3">{error}</p>}
        <button onClick={handleAdd} className="px-4 py-2.5 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors">
          Добавить
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {items.map((a) => (
          <div key={a.id} className="bg-white border border-slate-200 rounded-2xl p-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs text-slate-400 mb-1">{a.icon}</p>
              <p className="font-semibold text-sm mb-1">{a.title}</p>
              <p className="text-sm text-slate-600">{a.description}</p>
            </div>
            <button onClick={() => handleDelete(a.id)} className="text-sm text-red-500 hover:text-red-700 shrink-0">
              Удалить
            </button>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-slate-400 col-span-full">Пока нет преимуществ.</p>}
      </div>
    </div>
  );
}
