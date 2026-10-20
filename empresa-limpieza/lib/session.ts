// Firma y verificación del JWT de sesión. Isomórfico (sin DB) para poder usarlo en proxy.ts y en tests.
import { jwtVerify, SignJWT } from "jose";

export const SESSION_COOKIE = "ml_session";
export const SESSION_MAX_AGE_S = 7 * 24 * 60 * 60;

function secret(): Uint8Array {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("SESSION_SECRET debe tener al menos 32 caracteres (ver .env.example)");
  return new TextEncoder().encode(s);
}

export async function signSession(userId: string): Promise<string> {
  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_S}s`)
    .sign(secret());
}

/** Devuelve el id de usuario o null si el token falta, es inválido o venció. */
export async function verifySession(token: string | undefined | null): Promise<string | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    return typeof payload.sub === "string" && payload.sub ? payload.sub : null;
  } catch {
    return null;
  }
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_MAX_AGE_S,
  };
}
