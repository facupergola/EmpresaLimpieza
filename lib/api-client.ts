"use client";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

type Opts = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  /** Por defecto un 401 manda a /login (sesión vencida a mitad de un poll). */
  redirectOn401?: boolean;
};

/** fetch same-origin con JSON. Lanza ApiError con el mensaje {error} del servidor. */
export async function api<T>(path: string, opts: Opts = {}): Promise<T> {
  const res = await fetch(path, {
    method: opts.method ?? "GET",
    headers: opts.body !== undefined ? { "content-type": "application/json" } : undefined,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    cache: "no-store",
  });
  if (res.status === 401 && opts.redirectOn401 !== false && typeof window !== "undefined") {
    // Recarga completa a propósito: la sesión venció y el estado en memoria ya no sirve.
    window.location.replace("/login");
  }
  if (res.status === 204) return undefined as T;
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) throw new ApiError(data.error || `Error ${res.status}`, res.status);
  return data as T;
}
