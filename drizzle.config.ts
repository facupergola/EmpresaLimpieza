import { defineConfig } from "drizzle-kit";

// drizzle-kit no carga .env por sí solo; Node >= 21.7 trae loadEnvFile.
try {
  process.loadEnvFile();
} catch {
  /* sin .env: se espera DATABASE_URL en el entorno */
}

if (!process.env.DATABASE_URL) {
  throw new Error("Falta DATABASE_URL (copiá .env.example a .env)");
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./db/schema.ts",
  out: "./drizzle",
  casing: "snake_case",
  dbCredentials: { url: process.env.DATABASE_URL },
});
