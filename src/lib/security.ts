const WINDOW_MS = 60_000;
const REQUEST_LIMIT = 10;

const ipStore = new Map<string, { count: number; start: number }>();

export function takeRateLimit(ip: string) {
  const now = Date.now();
  const current = ipStore.get(ip);

  if (!current || now - current.start > WINDOW_MS) {
    ipStore.set(ip, { count: 1, start: now });
    return { allowed: true, remaining: REQUEST_LIMIT - 1 };
  }

  if (current.count >= REQUEST_LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  current.count += 1;
  ipStore.set(ip, current);
  return { allowed: true, remaining: REQUEST_LIMIT - current.count };
}

export async function fetchTextWithTimeout(url: string, timeoutMs = 12_000, init?: RequestInit) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    if (!res.ok) {
      throw new Error(`upstream error: ${res.status}`);
    }
    return await res.text();
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchJsonWithTimeout<T>(url: string, timeoutMs = 12_000, init?: RequestInit) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    if (!res.ok) {
      throw new Error(`upstream error: ${res.status}`);
    }
    return (await res.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}
