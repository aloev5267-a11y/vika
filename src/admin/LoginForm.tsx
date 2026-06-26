import { useState } from 'react';

interface Props {
  onSubmit: (password: string) => void;
  error: string;
}

export default function LoginForm({ onSubmit, error }: Props) {
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await onSubmit(password);
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white border border-slate-200 rounded-2xl p-8 shadow-sm"
      >
        <h1 className="text-xl font-bold mb-1">Виктория — Админ</h1>
        <p className="text-sm text-slate-500 mb-6">Введите пароль администратора</p>

        <label className="block text-xs font-medium text-slate-500 mb-1.5">Пароль</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-slate-900 focus:outline-none mb-4"
          placeholder="••••••••"
        />

        {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

        <button
          type="submit"
          disabled={submitting || !password}
          className="w-full py-2.5 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 disabled:opacity-50 transition-colors"
        >
          {submitting ? 'Вход…' : 'Войти'}
        </button>

        <a href="/" className="block text-center text-sm text-slate-400 hover:text-slate-600 mt-4 transition-colors">
          Вернуться на сайт
        </a>
      </form>
    </div>
  );
}
