import "server-only";
import { ValidationError } from "./validate";

/** Lee el body JSON; si no es JSON válido lanza ValidationError (→ 400). */
export async function readJson(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    throw new ValidationError("El cuerpo de la petición debe ser JSON.");
  }
}

export const json = (data: unknown, status = 200) => Response.json(data, { status });

/** Convierte excepciones en respuestas: ValidationError → su status; otras → 500 con log. */
export function errorResponse(e: unknown): Response {
  if (e instanceof ValidationError) return json({ error: e.message }, e.status);
  console.error(e);
  return json({ error: "Error interno. Reintentá en unos segundos." }, 500);
}

/**
 * Código de error de Postgres (p. ej. 23505 unique_violation), si lo hay.
 * Drizzle envuelve el error del driver en DrizzleQueryError: el código real está en `cause`.
 */
export function pgCode(e: unknown): string | undefined {
  let cur: unknown = e;
  for (let depth = 0; depth < 5 && typeof cur === "object" && cur !== null; depth++) {
    const o = cur as { code?: unknown; cause?: unknown };
    if (typeof o.code === "string" && /^\d{5}$/.test(o.code)) return o.code;
    cur = o.cause;
  }
  return undefined;
}
