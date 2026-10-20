"use client";
import { useCallback, useEffect, useRef } from "react";

/**
 * Reemplazo del realtime de Supabase: ejecuta `fn` al montar y cada `ms`.
 * Se pausa con la pestaña oculta y vuelve a consultar al volver. Devuelve `refresh` para forzar una carga.
 */
export function usePolling(fn: () => Promise<void> | void, ms = 5000) {
  const ref = useRef(fn);
  useEffect(() => {
    ref.current = fn;
  }, [fn]);

  const refresh = useCallback(async () => {
    if (typeof document !== "undefined" && document.hidden) return;
    await ref.current();
  }, []);

  useEffect(() => {
    void refresh();
    const id = setInterval(() => void refresh(), ms);
    const onVis = () => {
      if (!document.hidden) void refresh();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [ms, refresh]);

  return refresh;
}
