import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { config, db } from "@/db";
import { requireAdmin, requireUser } from "@/lib/auth";
import { errorResponse, json, readJson } from "@/lib/http";
import { configInput } from "@/lib/validate";

/** Datos de aviso al jefe (WhatsApp / email). */
export async function GET() {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  const [row] = await db.select().from(config).where(eq(config.id, "main")).limit(1);
  return json({ phone: row?.phone ?? "", email: row?.email ?? "" });
}

/** Guarda los avisos (solo admin). */
export async function PUT(req: NextRequest) {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;
  try {
    const input = configInput(await readJson(req));
    await db
      .insert(config)
      .values({ id: "main", ...input })
      .onConflictDoUpdate({ target: config.id, set: input });
    return json(input);
  } catch (e) {
    return errorResponse(e);
  }
}
