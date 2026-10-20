// Port de los CHECK de supabase/schema.sql, con mensajes en español para la UI.

export class ValidationError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

type Obj = Record<string, unknown>;

export function asObject(body: unknown): Obj {
  if (!body || typeof body !== "object" || Array.isArray(body)) throw new ValidationError("Datos inválidos.");
  return body as Obj;
}

export function str(o: Obj, key: string, min: number, max: number, label: string): string {
  const v = typeof o[key] === "string" ? (o[key] as string).trim() : "";
  if (v.length < min || v.length > max) {
    throw new ValidationError(
      min > 0 ? `${label}: entre ${min} y ${max} caracteres.` : `${label}: máximo ${max} caracteres.`,
    );
  }
  return v;
}

export function num(o: Obj, key: string, min: number, max: number, label: string): number {
  const raw = o[key];
  const v = typeof raw === "number" ? raw : typeof raw === "string" && raw.trim() !== "" ? Number(raw) : NaN;
  if (!Number.isFinite(v) || v < min || v > max) throw new ValidationError(`${label}: valor inválido.`);
  return v;
}

export function optNum(o: Obj, key: string, min: number, max: number, label: string): number | null {
  if (o[key] === undefined || o[key] === null || o[key] === "") return null;
  return num(o, key, min, max, label);
}

export function siteInput(body: unknown) {
  const o = asObject(body);
  return {
    name: str(o, "name", 2, 120, "Nombre del lugar"),
    lat: num(o, "lat", -90, 90, "Latitud"),
    lng: num(o, "lng", -180, 180, "Longitud"),
    radius: o.radius === undefined || o.radius === "" ? 150 : Math.round(num(o, "radius", 20, 1000, "Radio")),
  };
}

export function configInput(body: unknown) {
  const o = asObject(body);
  return {
    phone: str(o, "phone", 0, 20, "WhatsApp"),
    email: str(o, "email", 0, 120, "Email"),
  };
}

export function checkInInput(body: unknown) {
  const o = asObject(body);
  return {
    name: str(o, "name", 3, 120, "Nombre"),
    dni: str(o, "dni", 4, 20, "DNI / Legajo"),
    siteId: str(o, "siteId", 1, 64, "Lugar"),
    lat: num(o, "lat", -90, 90, "Latitud"),
    lng: num(o, "lng", -180, 180, "Longitud"),
    acc: Math.round(num(o, "acc", 0, 100000, "Precisión")),
  };
}

export function checkOutInput(body: unknown) {
  const o = asObject(body ?? {});
  return {
    lat: optNum(o, "lat", -90, 90, "Latitud"),
    lng: optNum(o, "lng", -180, 180, "Longitud"),
  };
}

export function loginInput(body: unknown) {
  const o = asObject(body);
  return {
    email: str(o, "email", 3, 120, "Email").toLowerCase(),
    password: typeof o.password === "string" ? o.password : "",
  };
}

export function userInput(body: unknown) {
  const o = asObject(body);
  const email = str(o, "email", 3, 120, "Email").toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ValidationError("Email inválido.");
  const password = typeof o.password === "string" ? o.password : "";
  if (password.length < 8) throw new ValidationError("La contraseña debe tener al menos 8 caracteres.");
  return {
    email,
    password,
    name: str(o, "name", 0, 120, "Nombre"),
    isAdmin: o.isAdmin === true,
  };
}
