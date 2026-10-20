import { count, desc, eq, gte } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { db, shifts, sites } from "@/db";
import { requireUser } from "@/lib/auth";
import { errorResponse, json, pgCode, readJson } from "@/lib/http";
import { validateCheckIn } from "@/lib/shift-rules";
import type { ShiftsResponse } from "@/lib/types";
import { checkInInput } from "@/lib/validate";

/**
 * ?scope=mine (default): el turno activo del usuario + sus últimos 5 registros (también para admins: es su vista de empleado).
 * ?scope=admin (solo admin): todos los activos + los últimos 30 cerrados + ingresos desde ?todayStart (ms, medianoche local del cliente).
 */
export async function GET(req: NextRequest) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  const { user } = auth;
  const scope = req.nextUrl.searchParams.get("scope") ?? "mine";

  if (scope !== "admin" || !user.isAdmin) {
    const recent = await db
      .select()
      .from(shifts)
      .where(eq(shifts.userId, user.id))
      .orderBy(desc(shifts.inAt))
      .limit(5);
    const active = recent.filter((s) => s.status === "active");
    return json({ active, recent, todayCount: 0 } satisfies ShiftsResponse);
  }

  const todayStartRaw = Number(req.nextUrl.searchParams.get("todayStart"));
  const todayStart = Number.isFinite(todayStartRaw) && todayStartRaw > 0 ? todayStartRaw : startOfTodayServer();

  const [active, recent, [{ n }]] = await Promise.all([
    db.select().from(shifts).where(eq(shifts.status, "active")).orderBy(desc(shifts.inAt)),
    db.select().from(shifts).where(eq(shifts.status, "done")).orderBy(desc(shifts.inAt)).limit(30),
    db.select({ n: count() }).from(shifts).where(gte(shifts.inAt, todayStart)),
  ]);
  return json({ active, recent, todayCount: Number(n) } satisfies ShiftsResponse);
}

function startOfTodayServer() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** Registrar ingreso. El servidor decide hora, usuario, lugar y distancia (port del trigger shifts_ins). */
export async function POST(req: NextRequest) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  try {
    const input = checkInInput(await readJson(req));
    const [site] = await db.select().from(sites).where(eq(sites.id, input.siteId)).limit(1);
    const check = validateCheckIn(site, { lat: input.lat, lng: input.lng, acc: input.acc });
    if (!check.ok) return json({ error: check.error }, 400);

    const [created] = await db
      .insert(shifts)
      .values({
        userId: auth.user.id,
        name: input.name,
        dni: input.dni,
        siteId: site.id,
        siteName: site.name,
        status: "active",
        inAt: Date.now(),
        inLat: input.lat,
        inLng: input.lng,
        inAcc: input.acc,
        inDist: check.distance,
      })
      .returning();
    return json(created, 201);
  } catch (e) {
    if (pgCode(e) === "23505") return json({ error: "Ya tenés un ingreso activo." }, 409);
    return errorResponse(e);
  }
}

