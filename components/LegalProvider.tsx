"use client";
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { legalHtml, type LegalKind } from "@/lib/legal";

type Ctx = { open: (k: LegalKind) => void; close: () => void };
const LegalContext = createContext<Ctx>({ open: () => {}, close: () => {} });

export const useLegal = () => useContext(LegalContext);

// Modal de Política / Términos. Vive en el layout: lo abren el footer y el checkbox de consentimiento.
export function LegalProvider({ children }: { children: ReactNode }) {
  const [kind, setKind] = useState<LegalKind | null>(null);
  const open = useCallback((k: LegalKind) => setKind(k), []);
  const close = useCallback(() => setKind(null), []);
  return (
    <LegalContext.Provider value={{ open, close }}>
      {children}
      <div
        className="md"
        hidden={kind === null}
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
      >
        <div className="mb">
          {kind && <div dangerouslySetInnerHTML={{ __html: legalHtml(kind) }} />}
          <button className="big" onClick={close}>
            Cerrar
          </button>
        </div>
      </div>
    </LegalContext.Provider>
  );
}
