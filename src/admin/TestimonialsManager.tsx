import { useState } from 'react';
import type { Testimonial } from '../lib/content';
import { adminApi } from './adminApi';

interface Props {
  items: Testimonial[];
  onChange: (msg: string) => void;
}

export default function TestimonialsManager({ items, onChange }: Props) {
  const [draft, setDraft] = useState({ author: '', text: '' });
  const [error, setError] = useState('');

  const handleAdd = async () => {
    if (!draft.author || !draft.text) {
      setError('Заполните имя и текст отзыва');
      return;
    }
    setError('');
    await adminApi.createTestimonial(draft);
    setDraft({ author: '', text: '' });
    onChange('Отзыв добавлен');
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;
    await adminApi.deleteTestimonial(id);
    onChange('Отзыв удалён');
  };

  return (
    <div className="space-y-8">
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <h2 className="font-semibold mb-4">Добавить отзыв</h2>
        <input
          value={draft.author}
          onChange={(e) => setDraft((d) => ({ ...d, author: e.target.value }))}
          placeholder="Имя клиента (напр. «Анна С.»)"
          className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-slate-900 focus:outline-none mb-3"
        />
        <textarea
          value={draft.text}
          onChange={(e) => setDraft((d) => ({ ...d, text: e.target.value }))}
          placeholder="Текст отзыва"
          rows={3}
          className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-slate-900 focus:outline-none mb-4 resize-none"
        />
        {error && <p className="text-sm text-red-500 mb-3">{error}</p>}
        <button onClick={handleAdd} className="px-4 py-2.5 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors">
          Добавить
        </button>
      </div>

      <div className="space-y-3">
        {items.map((t) => (
          <div key={t.id} className="bg-white border border-slate-200 rounded-2xl p-5 flex items-start justify-between gap-4">
            <div>
              <p className="font-semibold text-sm mb-1">{t.author}</p>
              <p className="text-sm text-slate-600">{t.text}</p>
            </div>
            <button onClick={() => handleDelete(t.id)} className="text-sm text-red-500 hover:text-red-700 shrink-0">
              Удалить
            </button>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-slate-400">Пока нет отзывов.</p>}
      </div>
    </div>
  );
}
