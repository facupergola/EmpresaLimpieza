import { and, eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { db, shifts } from "@/db";
import { requireUser } from "@/lib/auth";
import { errorResponse, json } from "@/lib/http";
import { checkOutInput } from "@/lib/validate";

/** Registrar salida: solo el propio turno activo (port del trigger shifts_upd). Lo demás queda inmutable. */
export async function POST(req: NextRequest, ctx: RouteContext<"/api/shifts/[id]/checkout">) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  try {
    const { id } = await ctx.params;
    const body = await req.text();
    const input = checkOutInput(body ? JSON.parse(body) : {});
    const [updated] = await db
      .update(shifts)
      .set({ status: "done", outAt: Date.now(), outLat: input.lat, outLng: input.lng })
      .where(and(eq(shifts.id, id), eq(shifts.userId, auth.user.id), eq(shifts.status, "active")))
      .returning();
    if (!updated) return json({ error: "No tenés un ingreso activo con ese id." }, 404);
    return json(updated);
  } catch (e) {
    if (e instanceof SyntaxError) return json({ error: "El cuerpo de la petición debe ser JSON." }, 400);
    return errorResponse(e);
  }
}

