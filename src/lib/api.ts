// Клиент для общения с бэкендом. Токен админа хранится в localStorage.

const TOKEN_KEY = 'lumiere_admin_token';

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

async function parse(res: Response) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data && (data as { error?: string }).error) || `Ошибка ${res.status}`);
  }
  return data;
}

export function apiGet<T = unknown>(path: string): Promise<T> {
  return fetch(path, {
    headers: authHeaders(),
  }).then(parse) as Promise<T>;
}

export function apiSend<T = unknown>(
  method: 'POST' | 'PUT' | 'DELETE',
  path: string,
  body?: unknown
): Promise<T> {
  return fetch(path, {
    method,
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  }).then(parse) as Promise<T>;
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// --- Авторизация ---
export async function login(password: string): Promise<void> {
  const { token } = await apiSend<{ token: string }>('POST', '/api/admin/login', { password });
  setToken(token);
}

export function logout() {
  setToken(null);
}

export async function verify(): Promise<boolean> {
  if (!getToken()) return false;
  try {
    await apiGet('/api/admin/verify');
    return true;
  } catch {
    setToken(null);
    return false;
  }
}

// --- Загрузка изображения, возвращает URL ---
export async function uploadImage(file: File): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch('/api/admin/upload', {
    method: 'POST',
    headers: authHeaders(),
    body: form,
  });
  const data = await parse(res);
  return (data as { url: string }).url;
}
