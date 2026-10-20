import { describe, expect, it } from "vitest";
import { validateCheckIn } from "../shift-rules";

const site = { name: "Escuela N° 12", lat: -34.6037, lng: -58.3816, radius: 150 };

describe("validateCheckIn (port del trigger shifts_ins)", () => {
  it("acepta un fix dentro del radio", () => {
    const r = validateCheckIn(site, { lat: -34.6040, lng: -58.3816, acc: 20 });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.distance).toBeLessThan(60);
  });
  it("rechaza lugar inexistente", () => {
    expect(validateCheckIn(null, { lat: 0, lng: 0, acc: 10 })).toEqual({ ok: false, error: "Lugar inexistente." });
  });
  it("rechaza sin ubicación", () => {
    const r = validateCheckIn(site, { lat: NaN, lng: -58.38, acc: 10 });
    expect(r).toEqual({ ok: false, error: "Falta ubicación." });
  });
  it("rechaza precisión peor que 200 m", () => {
    const r = validateCheckIn(site, { lat: site.lat, lng: site.lng, acc: 201 });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/poco precisa/);
  });
  it("tolera hasta radius + min(acc, 50)", () => {
    // ~190 m al norte: fuera con acc 10 (150+10), dentro con acc 50 (150+50)
    const lat = site.lat + 190 / 111320;
    expect(validateCheckIn(site, { lat, lng: site.lng, acc: 10 }).ok).toBe(false);
    expect(validateCheckIn(site, { lat, lng: site.lng, acc: 50 }).ok).toBe(true);
    // acc 100 no suma más de 50
    const lat2 = site.lat + 210 / 111320;
    expect(validateCheckIn(site, { lat: lat2, lng: site.lng, acc: 100 }).ok).toBe(false);
  });
  it("el mensaje de fuera de radio incluye la distancia y el nombre", () => {
    const r = validateCheckIn(site, { lat: site.lat + 0.01, lng: site.lng, acc: 10 });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/Estás a \d+ m de Escuela N° 12/);
  });
});
