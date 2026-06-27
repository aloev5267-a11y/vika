// Лёгкий клиент для публичных GET-запросов (контент сайта).
// Весь админский API и работа с токеном — в src/admin/adminApi.ts.

async function parse(res: Response) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data && (data as { error?: string }).error) || `Ошибка ${res.status}`);
  }
  return data;
}

export function apiGet<T = unknown>(path: string): Promise<T> {
  return fetch(path).then(parse) as Promise<T>;
}
