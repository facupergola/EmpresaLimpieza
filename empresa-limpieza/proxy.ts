import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

// Chequeo optimista: solo verifica firma y vencimiento del JWT (sin DB).
// Cada route handler vuelve a validar la sesión contra la base.
export async function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (await verifySession(token)) return NextResponse.next();

  const res = NextResponse.redirect(new URL("/login", request.url));
  if (token) res.cookies.delete(SESSION_COOKIE);
  return res;
}

export const config = {
  // Excluye /api (devuelve 401 por su cuenta), /login y los assets estáticos.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|login|.*\\.(?:svg|png|ico)).*)"],
};
