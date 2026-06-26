import { useState } from 'react';
import { uploadImage } from './adminApi';

interface Props {
  label: string;
  value: string;
  onChange: (url: string) => void;
}

export default function ImageUpload({ label, value, onChange }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      const url = await uploadImage(file);
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="block text-xs font-medium text-slate-500 mb-1.5">{label}</label>
      <div className="flex items-center gap-3">
        <div className="w-16 h-16 rounded-lg border border-slate-200 bg-slate-50 overflow-hidden shrink-0 flex items-center justify-center">
          {value ? (
            <img src={value || '/placeholder.svg'} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-[10px] text-slate-400">нет фото</span>
          )}
        </div>
        <label className="flex-1">
          <span className="inline-block px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-sm font-medium cursor-pointer transition-colors">
            {uploading ? 'Загрузка...' : 'Выбрать файл'}
          </span>
          <input type="file" accept="image/*" onChange={handleFile} disabled={uploading} className="hidden" />
        </label>
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
