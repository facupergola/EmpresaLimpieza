"use client";
import { useState } from "react";
import { api, ApiError } from "@/lib/api-client";
import { durS, fmtD, fmtT } from "@/lib/format";
import { geoErrorMessage, getPosition } from "@/lib/geo";
import { MAX_FIX_AGE_MS, validateCheckIn } from "@/lib/shift-rules";
import type { Shift } from "@/lib/types";
import { ActiveShift } from "./ActiveShift";
import { useLegal } from "./LegalProvider";
import { Msg, type MsgState } from "./Msg";
import { NotifButtons } from "./NotifButtons";
import { SiteSearch } from "./SiteSearch";
import { useAppData } from "./useAppData";

function ls(k: string, v?: string): string {
  try {
    if (v === undefined) return localStorage.getItem(k) || "";
    localStorage.setItem(k, v);
    return v;
  } catch {
    return "";
  }
}

/** Port de empView()/checkIn(): formulario de ingreso, turno activo y últimos registros. */
export function EmployeeView() {
  const { data, error, refresh } = useAppData("mine");
  const { open } = useLegal();

  // Prefill desde localStorage. El formulario recién se renderiza cuando hay datos (nunca en el SSR),
  // así que leer localStorage en el estado inicial no produce hydration mismatch.
  const [name, setName] = useState(() => ls("ml_name"));
  const [dni, setDni] = useState(() => ls("ml_dni"));
  const [siteId, setSiteId] = useState(() => ls("ml_site"));
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<MsgState>(null);
  const [justFinished, setJustFinished] = useState<Shift | null>(null);

  if (!data) return <div className="card empty">{error || "Cargando…"}</div>;

  // El último lugar guardado solo vale si todavía existe.
  const selectedSite = data.sites.some((s) => s.id === siteId) ? siteId : "";

  if (justFinished) {
    return (
      <div className="card live">
        <h2>👏 ¡Buen trabajo!</h2>
        <div className="msg ok">
          Salida registrada. Trabajaste {durS((justFinished.outAt ?? justFinished.inAt) - justFinished.inAt)}.
        </div>
        <NotifButtons r={justFinished} out cfg={data.cfg} />
        <button className="big" onClick={() => setJustFinished(null)}>
          Volver
        </button>
      </div>
    );
  }

  const active = data.shifts.active[0];
  if (active) {
    return (
      <ActiveShift
        shift={active}
        cfg={data.cfg}
        onCheckedOut={(done) => {
          setJustFinished(done);
          void refresh();
        }}
      />
    );
  }

  async function checkIn() {
    const n = name.trim();
    const d = dni.trim();
    if (n.length < 3 || d.length < 4 || !selectedSite) {
      return setMsg({ text: "Completá tu nombre, DNI y el lugar.", kind: "err" });
    }
    if (!consent) {
      return setMsg({
        text: "Para registrar tu ingreso tenés que aceptar el uso de tu ubicación y la política de privacidad.",
        kind: "err",
      });
    }
    const site = data!.sites.find((s) => s.id === selectedSite);
    setBusy(true);
    setMsg({ text: "Obteniendo tu ubicación…", kind: "info" });
    let pos: GeolocationPosition;
    try {
      pos = await getPosition();
    } catch (e) {
      setBusy(false);
      return setMsg({ text: geoErrorMessage(e as { code?: number }), kind: "err" });
    }
    const c = pos.coords;
    if (Math.abs(Date.now() - pos.timestamp) > MAX_FIX_AGE_MS) {
      setBusy(false);
      return setMsg({ text: "La hora de tu ubicación no es confiable. Reintentá.", kind: "err" });
    }
    // Pre-chequeo con las mismas reglas del servidor (mensaje inmediato, sin ida y vuelta).
    const pre = validateCheckIn(site, { lat: c.latitude, lng: c.longitude, acc: c.accuracy });
    if (!pre.ok) {
      setBusy(false);
      return setMsg({ text: pre.error, kind: "err" });
    }
    ls("ml_name", n);
    ls("ml_dni", d);
    ls("ml_site", selectedSite);
    try {
      await api<Shift>("/api/shifts", {
        method: "POST",
        body: { name: n, dni: d, siteId: selectedSite, lat: c.latitude, lng: c.longitude, acc: c.accuracy },
      });
      setMsg(null);
      await refresh();
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) {
        await refresh(); // ya había un ingreso activo (otra pestaña): pasar a la vista activa
      } else {
        setMsg({ text: e instanceof Error ? e.message : "No se pudo guardar. Reintentá.", kind: "err" });
      }
    } finally {
      setBusy(false);
    }
  }

  const mine = data.shifts.recent.slice(0, 5);

  return (
    <>
      <div className="card">
        <h2>👋 Registrar ingreso</h2>
        <div className="sec">Tu ubicación y hora se toman automáticamente al registrar.</div>
        <label htmlFor="nm">Nombre completo</label>
        <input id="nm" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Laura Gómez" autoComplete="name" />
        <label htmlFor="dn">DNI / Legajo</label>
        <input id="dn" value={dni} onChange={(e) => setDni(e.target.value)} placeholder="Ej: 30123456" inputMode="numeric" />
        <label htmlFor="sq">Edificio / Escuela</label>
        <SiteSearch sites={data.sites} value={selectedSite} onChange={setSiteId} />
        <label className="ck">
          <input type="checkbox" id="cs" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
          <span>
            Acepto que se registre mi ubicación y hora al fichar, según la{" "}
            <a onClick={() => open("p")}>Política de privacidad</a> y los <a onClick={() => open("t")}>Términos</a>.
          </span>
        </label>
        <button className="big" id="go" onClick={checkIn} disabled={busy || !data.sites.length}>
          📍 Registrar mi ingreso
        </button>
        <Msg m={msg} />
      </div>
      {mine.length > 0 && (
        <div className="card">
          <h3>Mis últimos registros</h3>
          {mine.map((x) => (
            <div className="row" key={x.id}>
              <div className="i">
                <b>{x.siteName}</b>
                <small>
                  {fmtD(x.inAt)} · {fmtT(x.inAt)}
                  {x.outAt ? " – " + fmtT(x.outAt) : ""}
                </small>
              </div>
              <span className="tag g">{x.outAt ? durS(x.outAt - x.inAt) : "activo"}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
