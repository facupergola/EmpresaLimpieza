import { asc } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { db, users } from "@/db";
import { hashPassword, requireAdmin } from "@/lib/auth";
import { errorResponse, json, pgCode, readJson } from "@/lib/http";
import { userInput } from "@/lib/validate";

const publicCols = { id: users.id, email: users.email, name: users.name, isAdmin: users.isAdmin, createdAt: users.createdAt };

/** Lista de cuentas (solo admin). Nunca devuelve el hash. */
export async function GET() {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;
  return json(await db.select(publicCols).from(users).orderBy(asc(users.createdAt)));
}

/** Alta de empleado o admin (solo admin). Reemplaza "Authentication → Users" de Supabase. */
export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;
  try {
    const input = userInput(await readJson(req));
    const [created] = await db
      .insert(users)
      .values({
        email: input.email,
        passwordHash: await hashPassword(input.password),
        name: input.name,
        isAdmin: input.isAdmin,
      })
      .returning(publicCols);
    return json(created, 201);
  } catch (e) {
    if (pgCode(e) === "23505") return json({ error: "Ya existe una cuenta con ese email." }, 409);
    return errorResponse(e);
  }
}
