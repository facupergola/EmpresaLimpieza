// Crea el primer administrador a partir de ADMIN_EMAIL / ADMIN_PASSWORD. Idempotente.
// Se ejecuta con `npm run db:seed` (tsx), fuera de Next: por eso no importa db/index.ts (server-only).
import bcrypt from "bcryptjs";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { users } from "./schema";

try {
  process.loadEnvFile();
} catch {
  /* sin .env */
}

function env(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Falta ${name} en .env`);
  return v;
}

async function main() {
  const DATABASE_URL = env("DATABASE_URL");
  const ADMIN_EMAIL = env("ADMIN_EMAIL");
  const ADMIN_PASSWORD = env("ADMIN_PASSWORD");
  if (ADMIN_PASSWORD.length < 8) throw new Error("ADMIN_PASSWORD debe tener al menos 8 caracteres");

  const client = postgres(DATABASE_URL, { max: 1 });
  const db = drizzle(client, { casing: "snake_case" });

  const inserted = await db
    .insert(users)
    .values({
      email: ADMIN_EMAIL.trim().toLowerCase(),
      passwordHash: await bcrypt.hash(ADMIN_PASSWORD, 10),
      name: "Administrador",
      isAdmin: true,
    })
    .onConflictDoNothing({ target: users.email })
    .returning({ id: users.id });

  console.log(
    inserted.length
      ? `Admin creado: ${ADMIN_EMAIL} (${inserted[0].id})`
      : `El usuario ${ADMIN_EMAIL} ya existía; no se modificó.`,
  );
  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
