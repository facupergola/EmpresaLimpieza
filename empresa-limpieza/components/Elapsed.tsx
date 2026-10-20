"use client";
import { useEffect, useState } from "react";
import { dur, durS } from "@/lib/format";

/** Port de tick(): tiempo transcurrido desde `since`, actualizado cada segundo. */
export function Elapsed({ since, short = false, className }: { since: number; short?: boolean; className?: string }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const ms = now - since;
  return <span className={className}>{short ? durS(ms) : dur(ms)}</span>;
}
