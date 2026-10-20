// Port de supabase/schema.sql sin auth.users, RLS ni triggers.
// La validación que hacían los triggers vive en lib/shift-rules.ts y lib/validate.ts;
// los CHECK se conservan acá para que la base también los imponga.
import { sql, type InferSelectModel } from "drizzle-orm";
import {
  bigint,
  boolean,
  check,
  doublePrecision,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: uuid().primaryKey().defaultRandom(),
    email: text().notNull().unique(),
    passwordHash: text().notNull(),
    name: text().notNull().default(""),
    isAdmin: boolean().notNull().default(false),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [check("users_email_len", sql`length(${t.email}) between 3 and 120`)],
);

export const sites = pgTable(
  "sites",
  {
    id: uuid().primaryKey().defaultRandom(),
    name: text().notNull(),
    lat: doublePrecision().notNull(),
    lng: doublePrecision().notNull(),
    radius: integer().notNull().default(150),
  },
  (t) => [
    check("sites_name_len", sql`length(${t.name}) between 2 and 120`),
    check("sites_lat_range", sql`${t.lat} between -90 and 90`),
    check("sites_lng_range", sql`${t.lng} between -180 and 180`),
    check("sites_radius_range", sql`${t.radius} between 20 and 1000`),
  ],
);

export const config = pgTable(
  "config",
  {
    id: text().primaryKey(),
    phone: text(),
    email: text(),
  },
  (t) => [
    check("config_id_main", sql`${t.id} = 'main'`),
    check("config_phone_len", sql`length(${t.phone}) <= 20`),
    check("config_email_len", sql`length(${t.email}) <= 120`),
  ],
);

export const shifts = pgTable(
  "shifts",
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    name: text().notNull(),
    dni: text().notNull(),
    // Si se borra el lugar, el fichaje queda con siteId null; siteName está desnormalizado.
    siteId: uuid().references(() => sites.id, { onDelete: "set null" }),
    siteName: text().notNull(),
    status: text({ enum: ["active", "done"] }).notNull().default("active"),
    // Milisegundos desde epoch (igual que la app original: Date.now()).
    inAt: bigint({ mode: "number" }).notNull(),
    inLat: doublePrecision(),
    inLng: doublePrecision(),
    inAcc: integer(),
    inDist: integer(),
    outAt: bigint({ mode: "number" }),
    outLat: doublePrecision(),
    outLng: doublePrecision(),
  },
  (t) => [
    uniqueIndex("one_active_per_user")
      .on(t.userId)
      .where(sql`${t.status} = 'active'`),
    index("shifts_in_at_idx").on(t.inAt.desc()),
    check("shifts_name_len", sql`length(${t.name}) between 3 and 120`),
    check("shifts_dni_len", sql`length(${t.dni}) between 4 and 20`),
  ],
);

export type User = InferSelectModel<typeof users>;
export type Site = InferSelectModel<typeof sites>;
export type Config = InferSelectModel<typeof config>;
export type Shift = InferSelectModel<typeof shifts>;
