import { useState } from 'react';
import type { SiteSettings } from '../lib/content';
import { adminApi } from './adminApi';
import ImageUpload from './ImageUpload';

interface Props {
  settings: SiteSettings;
  onChange: (msg: string) => void;
}

function parseCerts(raw: string): string[] {
  try {
    const v = JSON.parse(raw || '[]');
    return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export default function SettingsManager({ settings, onChange }: Props) {
  const [form, setForm] = useState<SiteSettings>(settings);
  const [certs, setCerts] = useState<string[]>(parseCerts(settings.master_certificates));
  const [newCert, setNewCert] = useState('');
  const [saving, setSaving] = useState(false);

  const set = (key: keyof SiteSettings, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminApi.updateSettings({ ...form, master_certificates: JSON.stringify(certs) });
      onChange('Настройки сохранены');
    } finally {
      setSaving(false);
    }
  };

  const inputCls = 'w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-slate-900 focus:outline-none';
  const card = 'bg-white border border-slate-200 rounded-2xl p-6';

  return (
    <div className="space-y-6">
      {/* КОНТАКТЫ */}
      <div className={card}>
        <h2 className="font-semibold mb-4">Контакты и адрес</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Телефон</label>
            <input value={form.phone} onChange={(e) => set('phone', e.target.value)} className={inputCls} placeholder="+375 33 681 5427" />
            <p className="text-xs text-slate-400 mt-1">Используется в шапке, контактах и кнопках Telegram / WhatsApp / Viber.</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Адрес</label>
            <input value={form.address} onChange={(e) => set('address', e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Ссылка на карту (embed src)</label>
            <input value={form.map_embed} onChange={(e) => set('map_embed', e.target.value)} className={inputCls} placeholder="https://www.google.com/maps/embed?..." />
            <p className="text-xs text-slate-400 mt-1">Вставьте URL из кода «Поделиться → Встроить карту» (только адрес из src).</p>
          </div>
        </div>
      </div>

      {/* О МАСТЕРЕ */}
      <div className={card}>
        <h2 className="font-semibold mb-4">О мастере</h2>
        <div className="space-y-3">
          <ImageUpload label="Фото мастера" value={form.master_photo} onChange={(url) => set('master_photo', url)} />
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Имя / заголовок</label>
            <input value={form.master_name} onChange={(e) => set('master_name', e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Опыт (короткая строка)</label>
            <input value={form.master_experience} onChange={(e) => set('master_experience', e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Описание</label>
            <textarea value={form.master_bio} onChange={(e) => set('master_bio', e.target.value)} rows={4} className={`${inputCls} resize-none`} />
          </div>

          {/* СЕРТИФИКАТЫ */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Сертификаты и дипломы</label>
            <div className="space-y-2 mb-2">
              {certs.map((c, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="flex-1 text-sm px-3 py-2 bg-slate-50 rounded-lg border border-slate-200">{c}</span>
                  <button
                    onClick={() => setCerts((arr) => arr.filter((_, idx) => idx !== i))}
                    className="text-sm text-red-500 hover:text-red-700"
                  >
                    Удалить
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={newCert}
                onChange={(e) => setNewCert(e.target.value)}
                placeholder="Например: Сертификат по электроэпиляции, 2021"
                className={inputCls}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newCert.trim()) {
                    setCerts((arr) => [...arr, newCert.trim()]);
                    setNewCert('');
                  }
                }}
              />
              <button
                onClick={() => {
                  if (newCert.trim()) {
                    setCerts((arr) => [...arr, newCert.trim()]);
                    setNewCert('');
                  }
                }}
                className="px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 font-medium text-sm shrink-0 transition-colors"
              >
                Добавить
              </button>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="px-6 py-2.5 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 disabled:opacity-50 transition-colors"
      >
        {saving ? 'Сохранение…' : 'Сохранить настройки'}
      </button>
    </div>
  );
}
