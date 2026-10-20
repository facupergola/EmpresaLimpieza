import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("Falta DATABASE_URL en .env");

// En dev Turbopack recarga módulos: cacheamos el cliente para no abrir conexiones nuevas en cada HMR.
const g = globalThis as unknown as { __mlSql?: ReturnType<typeof postgres> };
const client = g.__mlSql ?? postgres(url, { max: 10 });
if (process.env.NODE_ENV !== "production") g.__mlSql = client;

export const db = drizzle(client, { schema, casing: "snake_case" });
export * from "./schema";
