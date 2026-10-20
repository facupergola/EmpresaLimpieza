// Tipos compartidos entre API y componentes cliente (solo tipos: no arrastra drizzle al bundle).
import type { Shift as DbShift, Site as DbSite } from "@/db/schema";

export type Site = DbSite;
export type Shift = DbShift;
export type AppConfig = { phone: string; email: string };
export type SessionUser = { id: string; email: string; name: string; isAdmin: boolean };
export type UserRow = { id: string; email: string; name: string; isAdmin: boolean; createdAt: string };

/** Respuesta de GET /api/shifts. scope=mine: mi activo + mis últimos 5. scope=admin: todos los activos + 30 cerrados. */
export type ShiftsResponse = { active: Shift[]; recent: Shift[]; todayCount: number };
