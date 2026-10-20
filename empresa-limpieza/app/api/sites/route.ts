import { asc } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { db, sites } from "@/db";
import { requireAdmin, requireUser } from "@/lib/auth";
import { errorResponse, json, readJson } from "@/lib/http";
import { siteInput } from "@/lib/validate";

/** Lista de lugares (cualquier usuario logueado). */
export async function GET() {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  return json(await db.select().from(sites).orderBy(asc(sites.name)));
}

/** Alta de lugar (solo admin). */
export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;
  try {
    const input = siteInput(await readJson(req));
    const [created] = await db.insert(sites).values(input).returning();
    return json(created, 201);
  } catch (e) {
    return errorResponse(e);
  }
}
