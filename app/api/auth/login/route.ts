import { eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { db, users } from "@/db";
import { toSessionUser, verifyPassword } from "@/lib/auth";
import { errorResponse, json, readJson } from "@/lib/http";
import { SESSION_COOKIE, sessionCookieOptions, signSession } from "@/lib/session";
import { loginInput } from "@/lib/validate";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = loginInput(await readJson(req));
    const [u] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    // verifyPassword compara contra un hash dummy si el usuario no existe (tiempo constante).
    const ok = await verifyPassword(password, u?.passwordHash);
    if (!u || !ok) return json({ error: "Email o contraseña incorrectos." }, 401);

    const res = NextResponse.json({ user: toSessionUser(u) });
    res.cookies.set(SESSION_COOKIE, await signSession(u.id), sessionCookieOptions());
    return res;
  } catch (e) {
    return errorResponse(e);
  }
}
