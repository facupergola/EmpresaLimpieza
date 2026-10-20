"use client";
import { useState } from "react";
import { api } from "@/lib/api-client";
import { fmtT } from "@/lib/format";
import { geoErrorMessage, getPosition } from "@/lib/geo";
import type { AppConfig, Shift } from "@/lib/types";
import { Elapsed } from "./Elapsed";
import { Msg, type MsgState } from "./Msg";
import { NotifButtons } from "./NotifButtons";

const FRESH_MS = 600000; // 10 min: mostrar los botones de aviso tras el ingreso

/** Port de activeView()/checkOut(): "Trabajando ahora" + registrar salida. */
export function ActiveShift({
  shift,
  cfg,
  onCheckedOut,
}: {
  shift: Shift;
  cfg: AppConfig;
  onCheckedOut: (done: Shift) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<MsgState>(null);
  // Se evalúa una vez al montar (Date.now() no puede llamarse durante el render).
  const [fresh] = useState(() => Date.now() - shift.inAt < FRESH_MS);

  async function checkOut() {
    setBusy(true);
    setMsg({ text: "Obteniendo tu ubicación…", kind: "info" });
    let pos: GeolocationPosition;
    try {
      pos = await getPosition();
    } catch (e) {
      setBusy(false);
      return setMsg({ text: geoErrorMessage(e as { code?: number }), kind: "err" });
    }
    try {
      const done = await api<Shift>(`/api/shifts/${shift.id}/checkout`, {
        method: "POST",
        body: { lat: pos.coords.latitude, lng: pos.coords.longitude },
      });
      onCheckedOut(done);
    } catch (e) {
      setBusy(false);
      setMsg({ text: e instanceof Error ? e.message : "No se pudo guardar la salida.", kind: "err" });
    }
  }

  return (
    <div className="card live">
      <div>
        <span className="pulse" />
        <b>Trabajando ahora</b>
      </div>
      <div className="timer">
        <Elapsed since={shift.inAt} />
      </div>
      <div>
        <b>{shift.siteName}</b>
        <br />
        <small style={{ color: "var(--mut)" }}>
          Ingreso a las {fmtT(shift.inAt)} · {shift.name}
        </small>
      </div>
      {fresh && (
        <>
          <div className="msg ok">✅ Ingreso registrado. Avisale a tu jefe con un toque:</div>
          <NotifButtons r={shift} out={false} cfg={cfg} />
        </>
      )}
      <button className="big out" onClick={checkOut} disabled={busy}>
        🚪 Registrar mi salida
      </button>
      <Msg m={msg} />
    </div>
  );
}
