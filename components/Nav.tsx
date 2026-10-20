"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Nav() {
  const path = usePathname();
  const admin = path.startsWith("/admin");
  return (
    <nav>
      <Link href="/" className={admin ? "" : "on"}>
        Empleados
      </Link>
      <Link href="/admin" className={admin ? "on" : ""}>
        Admin
      </Link>
    </nav>
  );
}
