import { useState } from 'react';
import type { BeforeAfter } from '../lib/content';
import { adminApi } from './adminApi';
import ImageUpload from './ImageUpload';

interface Props {
  items: BeforeAfter[];
  onChange: (msg: string) => void;
}

const empty = { title: '', imageBefore: '', imageAfter: '' };

export default function GalleryManager({ items, onChange }: Props) {
  const [draft, setDraft] = useState(empty);
  const [error, setError] = useState('');

  const handleAdd = async () => {
    if (!draft.imageBefore || !draft.imageAfter) {
      setError('Загрузите оба фото: до и после');
      return;
    }
    setError('');
    await adminApi.createBeforeAfter(draft);
    setDraft(empty);
    onChange('Работа добавлена');
  };

  const handleDelete = async (id: number) => {
    await adminApi.deleteBeforeAfter(id);
    onChange('Работа удалена');
  };

  return (
    <div className="space-y-8">
      {/* ФОРМА ДОБАВЛЕНИЯ */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <h2 className="font-semibold mb-4">Добавить работу «до/после»</h2>
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <ImageUpload label="Фото ДО" value={draft.imageBefore} onChange={(url) => setDraft((d) => ({ ...d, imageBefore: url }))} />
          <ImageUpload label="Фото ПОСЛЕ" value={draft.imageAfter} onChange={(url) => setDraft((d) => ({ ...d, imageAfter: url }))} />
        </div>
        <input
          value={draft.title}
          onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
          placeholder="Название зоны (напр. «Ноги полностью»)"
          className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-slate-900 focus:outline-none mb-4"
        />
        {error && <p className="text-sm text-red-500 mb-3">{error}</p>}
        <button onClick={handleAdd} className="px-4 py-2.5 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors">
          Добавить
        </button>
      </div>

      {/* СПИСОК */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <div key={item.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-2">
              <img src={item.imageBefore || '/placeholder.svg'} alt="До" className="aspect-square object-cover" />
              <img src={item.imageAfter || '/placeholder.svg'} alt="После" className="aspect-square object-cover" />
            </div>
            <div className="p-4 flex items-center justify-between gap-2">
              <span className="text-sm font-medium truncate">{item.title || 'Без названия'}</span>
              <button onClick={() => handleDelete(item.id)} className="text-sm text-red-500 hover:text-red-700 shrink-0">
                Удалить
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-slate-400 col-span-full">Пока нет работ. Добавьте первую выше.</p>}
      </div>
    </div>
  );
}
