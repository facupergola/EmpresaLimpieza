import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { db, sites } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { errorResponse, json } from "@/lib/http";

/** Borra un lugar (solo admin). Los fichajes que lo referencian quedan con siteId null. */
export async function DELETE(_req: NextRequest, ctx: RouteContext<"/api/sites/[id]">) {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;
  try {
    const { id } = await ctx.params;
    const deleted = await db.delete(sites).where(eq(sites.id, id)).returning({ id: sites.id });
    if (!deleted.length) return json({ error: "Lugar inexistente." }, 404);
    return new Response(null, { status: 204 });
  } catch (e) {
    return errorResponse(e);
  }
}
