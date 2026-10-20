"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { Msg, type MsgState } from "./Msg";

/** Port de noDb()/doLogin(): tarjeta de inicio de sesión. */
export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<MsgState>(null);

  // Si ya hay sesión válida, ir directo a la app.
  useEffect(() => {
    api("/api/auth/me", { redirectOn401: false })
      .then(() => router.replace("/"))
      .catch(() => {});
  }, [router]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      await api("/api/auth/login", { method: "POST", body: { email, password }, redirectOn401: false });
      router.replace("/");
      router.refresh();
    } catch (err) {
      setMsg({ text: err instanceof Error ? err.message : "Email o contraseña incorrectos.", kind: "err" });
      setBusy(false);
    }
  }

  return (
    <form className="card" onSubmit={login}>
      <h2>Iniciá sesión</h2>
      <label htmlFor="lg_e">Email</label>
      <input id="lg_e" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
      <label htmlFor="lg_p">Contraseña</label>
      <input
        id="lg_p"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button className="big" type="submit" disabled={busy}>
        Ingresar
      </button>
      <Msg m={msg} />
      <div className="msg info" style={{ marginTop: 14 }}>
        Tu cuenta te la da tu empleador. Si no tenés una, pedila.
      </div>
    </form>
  );
}
