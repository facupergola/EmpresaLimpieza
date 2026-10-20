// Port literal de los helpers de formato de index.html.
export const fmtT = (t: number) =>
  new Date(t).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
export const fmtD = (t: number) => new Date(t).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" });

/** hh:mm:ss */
export const dur = (ms: number) => {
  ms = Math.max(0, ms);
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const x = s % 60;
  return [h, m, x].map((v) => String(v).padStart(2, "0")).join(":");
};

/** "3h 25m" */
export const durS = (ms: number) => {
  const m = Math.floor(Math.max(0, ms) / 60000);
  return Math.floor(m / 60) + "h " + (m % 60) + "m";
};

/** Iniciales para el avatar. */
export const ini = (n: string | null | undefined) =>
  (n || "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
