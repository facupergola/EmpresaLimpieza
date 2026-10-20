// Isomórfico: se usa en el cliente (pre-chequeo) y en el servidor (validación real).

/** Distancia en metros entre dos coordenadas (haversine). Port de dist() de index.html. */
export function distanceMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const r = (x: number) => (x * Math.PI) / 180;
  const dl = r(lat2 - lat1);
  const dn = r(lng2 - lng1);
  const h = Math.sin(dl / 2) ** 2 + Math.cos(r(lat1)) * Math.cos(r(lat2)) * Math.sin(dn / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Mensaje para errores de navigator.geolocation. Port de gerr(). */
export function geoErrorMessage(e: { code?: number } | null | undefined): string {
  const code = e?.code;
  if (code === 1) return "Permiso de ubicación denegado. Activalo en tu navegador para poder registrar.";
  if (code === 3) return "No se pudo obtener tu ubicación a tiempo. Probá al aire libre o con GPS activo.";
  return "Tu dispositivo no permite geolocalización.";
}

/** Port de getPos(): posición actual con alta precisión, 20 s de timeout. */
export function getPosition(): Promise<GeolocationPosition> {
  return new Promise((ok, ko) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return ko({ code: 0 });
    navigator.geolocation.getCurrentPosition(ok, ko, {
      enableHighAccuracy: true,
      timeout: 20000,
      maximumAge: 0,
    });
  });
}
