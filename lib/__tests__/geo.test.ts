import { describe, expect, it } from "vitest";
import { distanceMeters, geoErrorMessage } from "../geo";

describe("distanceMeters", () => {
  it("es 0 para el mismo punto", () => {
    expect(distanceMeters(-34.6, -58.4, -34.6, -58.4)).toBe(0);
  });
  it("mide ~111 km por grado de latitud", () => {
    const d = distanceMeters(0, 0, 1, 0);
    expect(d).toBeGreaterThan(111000);
    expect(d).toBeLessThan(111300);
  });
  it("Obelisco a Congreso (Buenos Aires) ≈ 1.6 km", () => {
    const d = distanceMeters(-34.6037, -58.3816, -34.6093, -58.3925);
    expect(d).toBeGreaterThan(1100);
    expect(d).toBeLessThan(1300);
  });
});

describe("geoErrorMessage", () => {
  it("distingue permiso denegado, timeout y no soportado", () => {
    expect(geoErrorMessage({ code: 1 })).toMatch(/Permiso/);
    expect(geoErrorMessage({ code: 3 })).toMatch(/a tiempo/);
    expect(geoErrorMessage({ code: 0 })).toMatch(/no permite/);
    expect(geoErrorMessage(null)).toMatch(/no permite/);
  });
});
