"use client";
import { useRouter } from "next/navigation";
import { useLegal } from "./LegalProvider";

export function Footer() {
  const { open } = useLegal();
  const router = useRouter();
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }
  return (
    <footer>
      © MANTEN LIMPIO · <a onClick={() => open("p")}>Política de privacidad</a>
      <a onClick={() => open("t")}>Términos y condiciones</a>
      <a onClick={logout}>Salir</a>
    </footer>
  );
}
