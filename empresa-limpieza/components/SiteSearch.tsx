"use client";
import { useState } from "react";
import type { Site } from "@/lib/types";

/** Port de sitesUI(): buscador + lista de edificios/escuelas. */
export function SiteSearch({
  sites,
  value,
  onChange,
}: {
  sites: Site[];
  value: string;
  onChange: (id: string) => void;
}) {
  const [q, setQ] = useState("");
  const t = q.trim().toLowerCase();
  const filtered = sites.filter((s) => s.name.toLowerCase().includes(t));
  return (
    <>
      <div className="srch">
        <input
          id="sq"
          placeholder="Buscar edificio o escuela…"
          autoComplete="off"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      <div className="sl" id="sl">
        {!sites.length ? (
          <div className="empty">No hay lugares cargados</div>
        ) : !filtered.length ? (
          <div className="empty">Sin resultados</div>
        ) : (
          filtered.map((s) => (
            <div key={s.id} className={`opt ${s.id === value ? "on" : ""}`} onClick={() => onChange(s.id)}>
              <span>🏢 {s.name}</span>
              {s.id === value && <b>✓</b>}
            </div>
          ))
        )}
      </div>
    </>
  );
}
