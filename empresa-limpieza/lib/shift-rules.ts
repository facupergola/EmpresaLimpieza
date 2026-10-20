// Port del trigger shifts_ins de supabase/schema.sql: el servidor decide si el fichaje es válido.
import { distanceMeters } from "./geo";

export const MAX_ACCURACY_M = 200;
export const ACCURACY_TOLERANCE_M = 50;
/** Ventana máxima entre la hora del fix GPS y la hora actual (chequeo del cliente). */
export const MAX_FIX_AGE_MS = 120000;

export type SiteLike = { name: string; lat: number; lng: number; radius: number };
export type Fix = { lat: number; lng: number; acc: number };

export type CheckInResult = { ok: true; distance: number } | { ok: false; error: string };

export function validateCheckIn(site: SiteLike | null | undefined, fix: Fix): CheckInResult {
  if (!site) return { ok: false, error: "Lugar inexistente." };
  if (!Number.isFinite(fix.lat) || !Number.isFinite(fix.lng)) return { ok: false, error: "Falta ubicación." };
  const acc = Number.isFinite(fix.acc) ? fix.acc : 9999;
  if (acc > MAX_ACCURACY_M) {
    return { ok: false, error: `Ubicación poco precisa (±${Math.round(acc)} m). Activá el GPS y reintentá.` };
  }
  const d = distanceMeters(fix.lat, fix.lng, site.lat, site.lng);
  if (d > site.radius + Math.min(acc, ACCURACY_TOLERANCE_M)) {
    return {
      ok: false,
      error: `Estás a ${Math.round(d)} m de ${site.name}. Debés estar en el lugar para registrar el ingreso.`,
    };
  }
  return { ok: true, distance: Math.round(d) };
}
