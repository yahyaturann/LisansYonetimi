export async function istemciIstek<T>(url: string, init?: RequestInit) {
  const yanit = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    }
  });

  const json = await yanit.json();

  if (!yanit.ok || json.success === false) {
    throw new Error(json.message ?? "İstek başarısız oldu.");
  }

  return json as T;
}
