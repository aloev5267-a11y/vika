// Клиент админ-API. Токен хранится в localStorage и шлётся в заголовке Authorization.

const TOKEN_KEY = 'lumiere_admin_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

interface ReqOptions {
  method?: string;
  body?: unknown;
}

async function request<T>(path: string, { method = 'GET', body }: ReqOptions = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    clearToken();
    throw new Error('Сессия истекла. Войдите снова.');
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string }).error || 'Ошибка запроса');
  }
  return data as T;
}

export async function login(password: string): Promise<string> {
  const res = await fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error || 'Неверный пароль');
  const token = (data as { token: string }).token;
  setToken(token);
  return token;
}

export async function verify(): Promise<boolean> {
  if (!getToken()) return false;
  try {
    await request('/api/admin/verify');
    return true;
  } catch {
    return false;
  }
}

export const adminApi = {
  getContent: () => request<import('../lib/content').SiteContent>('/api/admin/content'),

  createTestimonial: (b: { author: string; text: string; sortOrder?: number }) =>
    request('/api/admin/testimonials', { method: 'POST', body: b }),
  updateTestimonial: (id: number, b: { author: string; text: string; sortOrder?: number }) =>
    request(`/api/admin/testimonials/${id}`, { method: 'PUT', body: b }),
  deleteTestimonial: (id: number) => request(`/api/admin/testimonials/${id}`, { method: 'DELETE' }),

  createBeforeAfter: (b: { title: string; imageBefore: string; imageAfter: string; sortOrder?: number }) =>
    request('/api/admin/before-after', { method: 'POST', body: b }),
  updateBeforeAfter: (id: number, b: { title: string; imageBefore: string; imageAfter: string; sortOrder?: number }) =>
    request(`/api/admin/before-after/${id}`, { method: 'PUT', body: b }),
  deleteBeforeAfter: (id: number) => request(`/api/admin/before-after/${id}`, { method: 'DELETE' }),

  createAdvantage: (b: { icon: string; title: string; description: string; sortOrder?: number }) =>
    request('/api/admin/advantages', { method: 'POST', body: b }),
  updateAdvantage: (id: number, b: { icon: string; title: string; description: string; sortOrder?: number }) =>
    request(`/api/admin/advantages/${id}`, { method: 'PUT', body: b }),
  deleteAdvantage: (id: number) => request(`/api/admin/advantages/${id}`, { method: 'DELETE' }),

  updateSettings: (b: Record<string, string>) => request('/api/admin/settings', { method: 'PUT', body: b }),
};

/** Загрузка изображения. Возвращает { url }. */
export async function uploadImage(file: File): Promise<string> {
  const token = getToken();
  const form = new FormData();
  form.append('file', file);
  const res = await fetch('/api/admin/upload', {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error || 'Не удалось загрузить файл');
  return (data as { url: string }).url;
}
