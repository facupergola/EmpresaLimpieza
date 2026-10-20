"use client";
import { useCallback, useState } from "react";
import { api } from "@/lib/api-client";
import type { AppConfig, SessionUser, ShiftsResponse, Site } from "@/lib/types";
import { usePolling } from "./usePolling";

export type AppData = { user: SessionUser; sites: Site[]; cfg: AppConfig; shifts: ShiftsResponse };

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/**
 * Carga (y re-carga cada 5 s) todo lo que antes llegaba por onSnapshot: usuario, lugares, avisos y fichajes.
 * scope "mine": fichajes propios (vista de empleado, también para admins). scope "admin": panel completo.
 */
export function useAppData(scope: "mine" | "admin") {
  const [data, setData] = useState<AppData | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const [me, sites, cfg, shifts] = await Promise.all([
        api<{ user: SessionUser }>("/api/auth/me"),
        api<Site[]>("/api/sites"),
        api<AppConfig>("/api/config"),
        api<ShiftsResponse>(`/api/shifts?scope=${scope}&todayStart=${startOfToday()}`),
      ]);
      setData({ user: me.user, sites, cfg, shifts });
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo conectar con el servidor.");
    }
  }, [scope]);

  const refresh = usePolling(load, 5000);
  return { data, error, refresh };
}
