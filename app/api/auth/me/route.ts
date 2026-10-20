import { requireUser } from "@/lib/auth";
import { json } from "@/lib/http";

export async function GET() {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  return json({ user: auth.user });
}
