import "server-only";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { db, users } from "@/db";
import { SESSION_COOKIE, verifySession } from "./session";

export type SessionUser = { id: string; email: string; name: string; isAdmin: boolean };

const BCRYPT_COST = 10;
// Hash de relleno para que un email inexistente tarde lo mismo que uno real.
const DUMMY_HASH = bcrypt.hashSync("dummy-password-for-timing", BCRYPT_COST);

export const hashPassword = (pw: string) => bcrypt.hash(pw, BCRYPT_COST);
export const verifyPassword = (pw: string, hash: string | null | undefined) =>
  bcrypt.compare(pw, hash ?? DUMMY_HASH);

export const toSessionUser = (u: { id: string; email: string; name: string; isAdmin: boolean }): SessionUser => ({
  id: u.id,
  email: u.email,
  name: u.name,
  isAdmin: u.isAdmin,
});

/** Lee la cookie, verifica el JWT y relee el usuario de la DB (así un borrado o cambio de rol aplica al instante). */
export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const uid = await verifySession(store.get(SESSION_COOKIE)?.value);
  if (!uid) return null;
  const [u] = await db.select().from(users).where(eq(users.id, uid)).limit(1);
  return u ? toSessionUser(u) : null;
}

export const unauthorized = () => Response.json({ error: "Iniciá sesión para continuar." }, { status: 401 });
export const forbidden = () =>
  Response.json({ error: "Esta acción es solo para administradores." }, { status: 403 });

export async function requireUser(): Promise<{ user: SessionUser } | { response: Response }> {
  const user = await getSessionUser();
  return user ? { user } : { response: unauthorized() };
}

export async function requireAdmin(): Promise<{ user: SessionUser } | { response: Response }> {
  const user = await getSessionUser();
  if (!user) return { response: unauthorized() };
  if (!user.isAdmin) return { response: forbidden() };
  return { user };
}
