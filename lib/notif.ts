// Port de notifText()/notifBtns(): aviso al jefe por WhatsApp o email.
import { fmtT } from "./format";
import type { Shift } from "./types";

export function notifText(r: Shift, out: boolean): string {
  const at = out ? r.outAt ?? Date.now() : r.inAt;
  const lat = out ? r.outLat : r.inLat;
  const lng = out ? r.outLng : r.inLng;
  return `${out ? "🔴 SALIDA" : "🟢 INGRESO"} – MANTEN LIMPIO\n${r.name} (DNI ${r.dni})\n${r.siteName}\nHora: ${fmtT(at)}\nUbicación: https://maps.google.com/?q=${lat},${lng}`;
}

export function whatsappLink(phone: string, text: string): string | null {
  const ph = (phone || "").replace(/\D/g, "");
  return ph ? `https://wa.me/${ph}?text=${encodeURIComponent(text)}` : null;
}

export function mailtoLink(email: string, r: Shift, out: boolean, text: string): string | null {
  if (!email) return null;
  const subject = (out ? "Salida" : "Ingreso") + " – " + r.name;
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
}
