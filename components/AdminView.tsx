"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { durS, fmtD, fmtT, ini } from "@/lib/format";
import { geoErrorMessage, getPosition } from "@/lib/geo";
import type { AppConfig, Site, UserRow } from "@/lib/types";
import { Elapsed } from "./Elapsed";
import { Msg, type MsgState } from "./Msg";
import { useAppData } from "./useAppData";

const errText = (e: unknown, fallback: string) => (e instanceof Error ? e.message : fallback);

/** "Avisos al jefe". Se monta recién con datos cargados: el estado inicial viene de la API y el poll no lo pisa. */
function AvisosCard({ initial, onSaved }: { initial: AppConfig; onSaved: () => Promise<void> }) {
  const [ph, setPh] = useState(initial.phone);
  const [em, setEm] = useState(initial.email);
  const [cfgMsg, setCfgMsg] = useState<MsgState>(null);

  async function saveCfg() {
    try {
      await api("/api/config", { method: "PUT", body: { phone: ph.trim(), email: em.trim() } });
      setCfgMsg({ text: "Guardado ✅", kind: "ok" });
      await onSaved();
    } catch (e) {
      setCfgMsg({ text: errText(e, "No se pudo guardar."), kind: "err" });
    }
  }

  return (
    <div className="card">
      <h3>🔔 Avisos al jefe</h3>
      <label htmlFor="ph">WhatsApp (con código de país, ej: 5492215551234)</label>
      <input id="ph" inputMode="tel" value={ph} onChange={(e) => setPh(e.target.value)} />
      <label htmlFor="em">Email</label>
      <input id="em" type="email" value={em} onChange={(e) => setEm(e.target.value)} />
      <button className="big" style={{ marginTop: 14 }} onClick={saveCfg}>
        Guardar avisos
      </button>
      <Msg m={cfgMsg} />
    </div>
  );
}

/** "Usuarios" (nuevo): reemplaza "Authentication → Users" del dashboard de Supabase. */
function UsersCard() {
  const [userList, setUserList] = useState<UserRow[] | null>(null);
  const [version, setVersion] = useState(0);
  const [ue, setUe] = useState("");
  const [up, setUp] = useState("");
  const [un, setUn] = useState("");
  const [ua, setUa] = useState(false);
  const [userMsg, setUserMsg] = useState<MsgState>(null);

  useEffect(() => {
    let alive = true;
    api<UserRow[]>("/api/admin/users")
      .then((list) => {
        if (alive) setUserList(list);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [version]);

  async function addUser() {
    try {
      await api<UserRow>("/api/admin/users", {
        method: "POST",
        body: { email: ue.trim(), password: up, name: un.trim(), isAdmin: ua },
      });
      setUe("");
      setUp("");
      setUn("");
      setUa(false);
      setUserMsg({ text: "Cuenta creada ✅", kind: "ok" });
      setVersion((v) => v + 1);
    } catch (e) {
      setUserMsg({ text: errText(e, "No se pudo crear la cuenta."), kind: "err" });
    }
  }

  return (
    <div className="card">
      <h3>👥 Usuarios</h3>
      {userList === null ? (
        <div className="empty">Cargando…</div>
      ) : userList.length ? (
        userList.map((u) => (
          <div className="row" key={u.id}>
            <div className="av">{ini(u.name || u.email)}</div>
            <div className="i">
              <b>{u.name || u.email}</b>
              <small>{u.email}</small>
            </div>
            <span className={`tag ${u.isAdmin ? "" : "g"}`}>{u.isAdmin ? "admin" : "empleado"}</span>
          </div>
        ))
      ) : (
        <div className="empty">Sin usuarios.</div>
      )}
      <label htmlFor="ue">Email</label>
      <input id="ue" type="email" autoComplete="off" value={ue} onChange={(e) => setUe(e.target.value)} />
      <label htmlFor="up">Contraseña (mínimo 8 caracteres)</label>
      <input id="up" type="password" autoComplete="new-password" value={up} onChange={(e) => setUp(e.target.value)} />
      <label htmlFor="un">Nombre</label>
      <input id="un" value={un} onChange={(e) => setUn(e.target.value)} placeholder="Ej: Laura Gómez" />
      <label className="ck">
        <input type="checkbox" checked={ua} onChange={(e) => setUa(e.target.checked)} />
        <span>Es administrador (ve el panel y los datos de todos).</span>
      </label>
      <button className="big" style={{ marginTop: 14 }} onClick={addUser}>
        ➕ Crear cuenta
      </button>
      <Msg m={userMsg} />
    </div>
  );
}

/** Port de adminView(): panel en vivo, lugares, avisos y (nuevo) usuarios. */
export function AdminView() {
  const { data, error, refresh } = useAppData("admin");

  // Formulario "Agregar lugar"
  const [sn, setSn] = useState("");
  const [sa, setSa] = useState("");
  const [so, setSo] = useState("");
  const [sr, setSr] = useState("150");
  const [siteMsg, setSiteMsg] = useState<MsgState>(null);

  if (!data) return <div className="card empty">{error || "Cargando…"}</div>;
  if (!data.user.isAdmin) {
    return (
      <div className="card">
        <h2>🔒 Acceso restringido</h2>
        <div className="msg err">
          Esta sección es solo para administradores. Tu cuenta no tiene rol de administrador.
        </div>
      </div>
    );
  }

  const { active, recent, todayCount } = data.shifts;
  const bySite: Record<string, number> = {};
  active.forEach((x) => {
    bySite[x.siteName] = (bySite[x.siteName] || 0) + 1;
  });

  async function useHere() {
    setSiteMsg({ text: "Buscando ubicación…", kind: "info" });
    try {
      const p = await getPosition();
      setSa(p.coords.latitude.toFixed(6));
      setSo(p.coords.longitude.toFixed(6));
      setSiteMsg({ text: "Ubicación cargada. Poné el nombre y agregá.", kind: "ok" });
    } catch (e) {
      setSiteMsg({ text: geoErrorMessage(e as { code?: number }), kind: "err" });
    }
  }

  async function addSite() {
    const n = sn.trim();
    const la = parseFloat(sa);
    const lo = parseFloat(so);
    const r = parseInt(sr) || 150;
    if (!n || isNaN(la) || isNaN(lo)) return setSiteMsg({ text: "Completá nombre y coordenadas.", kind: "err" });
    try {
      await api<Site>("/api/sites", { method: "POST", body: { name: n, lat: la, lng: lo, radius: r } });
      setSn("");
      setSa("");
      setSo("");
      setSr("150");
      setSiteMsg({ text: "Lugar agregado ✅", kind: "ok" });
      await refresh();
    } catch (e) {
      setSiteMsg({ text: errText(e, "No se pudo guardar (¿tenés permiso de admin?)."), kind: "err" });
    }
  }

  async function delSite(id: string) {
    if (!confirm("¿Borrar este lugar?")) return;
    try {
      await api<void>(`/api/sites/${id}`, { method: "DELETE" });
      await refresh();
    } catch (e) {
      setSiteMsg({ text: errText(e, "No se pudo borrar."), kind: "err" });
    }
  }

  return (
    <>
      <div className="card">
        <h2>📊 Panel en vivo</h2>
        <div className="stats">
          <div className="stat main">
            <b>{active.length}</b>
            <span>Trabajando ahora</span>
          </div>
          <div className="stat">
            <b>{todayCount}</b>
            <span>Ingresos hoy</span>
          </div>
          <div className="stat">
            <b>{data.sites.length}</b>
            <span>Lugares</span>
          </div>
        </div>
        {Object.keys(bySite).length > 0 && (
          <div style={{ marginTop: 12, fontSize: 14, color: "var(--mut)" }}>
            {Object.entries(bySite).map(([k, v], i) => (
              <span key={k}>
                {i > 0 && " · "}
                <b style={{ color: "var(--tx)" }}>{k}</b>: {v}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h3>🟢 En el trabajo ahora</h3>
        {active.length ? (
          active.map((x) => (
            <div className="row" key={x.id}>
              <div className="av">{ini(x.name)}</div>
              <div className="i">
                <b>{x.name}</b>
                <small>
                  {x.siteName} · desde {fmtT(x.inAt)} · ±{x.inAcc} m
                </small>
              </div>
              <div style={{ textAlign: "right" }}>
                <Elapsed since={x.inAt} short className="tag" />
                <br />
                <a
                  className="mini"
                  style={{ marginTop: 6 }}
                  target="_blank"
                  rel="noopener"
                  href={`https://maps.google.com/?q=${x.inLat},${x.inLng}`}
                >
                  📍 Mapa
                </a>
              </div>
            </div>
          ))
        ) : (
          <div className="empty">Nadie está trabajando en este momento.</div>
        )}
      </div>

      <div className="card">
        <h3>🕘 Historial reciente</h3>
        <div className="scroll">
          {recent.length ? (
            recent.map((x) => (
              <div className="row" key={x.id}>
                <div className="av">{ini(x.name)}</div>
                <div className="i">
                  <b>{x.name}</b>
                  <small>
                    {x.siteName} · {fmtD(x.inAt)} {fmtT(x.inAt)} – {x.outAt ? fmtT(x.outAt) : ""}
                  </small>
                </div>
                <span className="tag g">{x.outAt ? durS(x.outAt - x.inAt) : ""}</span>
              </div>
            ))
          ) : (
            <div className="empty">Sin registros aún.</div>
          )}
        </div>
      </div>

      <div className="card">
        <h3>🏢 Edificios / Escuelas</h3>
        {data.sites.length ? (
          data.sites.map((s) => (
            <div className="row" key={s.id}>
              <div className="i">
                <b>{s.name}</b>
                <small>
                  Radio {s.radius} m · {s.lat.toFixed(5)}, {s.lng.toFixed(5)}
                </small>
              </div>
              <button className="mini d" onClick={() => delSite(s.id)}>
                Borrar
              </button>
            </div>
          ))
        ) : (
          <div className="empty">Cargá el primer lugar de trabajo.</div>
        )}
        <label htmlFor="sn">Nombre del lugar</label>
        <input id="sn" placeholder="Ej: Escuela N° 12" value={sn} onChange={(e) => setSn(e.target.value)} />
        <div className="two">
          <div>
            <label htmlFor="sa">Latitud</label>
            <input id="sa" inputMode="decimal" value={sa} onChange={(e) => setSa(e.target.value)} />
          </div>
          <div>
            <label htmlFor="so">Longitud</label>
            <input id="so" inputMode="decimal" value={so} onChange={(e) => setSo(e.target.value)} />
          </div>
        </div>
        <label htmlFor="sr">Radio permitido (metros)</label>
        <input id="sr" inputMode="numeric" value={sr} onChange={(e) => setSr(e.target.value)} />
        <div className="btns">
          <button className="mini" style={{ flex: 1 }} onClick={useHere}>
            📍 Usar mi ubicación actual
          </button>
          <button className="mini" style={{ flex: 1 }} onClick={addSite}>
            ➕ Agregar lugar
          </button>
        </div>
        <Msg m={siteMsg} />
      </div>

      <AvisosCard initial={data.cfg} onSaved={refresh} />

      <UsersCard />
    </>
  );
}
