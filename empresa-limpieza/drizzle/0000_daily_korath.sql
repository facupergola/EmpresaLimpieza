CREATE TABLE "config" (
	"id" text PRIMARY KEY NOT NULL,
	"phone" text,
	"email" text,
	CONSTRAINT "config_id_main" CHECK ("config"."id" = 'main'),
	CONSTRAINT "config_phone_len" CHECK (length("config"."phone") <= 20),
	CONSTRAINT "config_email_len" CHECK (length("config"."email") <= 120)
);
--> statement-breakpoint
CREATE TABLE "shifts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"dni" text NOT NULL,
	"site_id" uuid,
	"site_name" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"in_at" bigint NOT NULL,
	"in_lat" double precision,
	"in_lng" double precision,
	"in_acc" integer,
	"in_dist" integer,
	"out_at" bigint,
	"out_lat" double precision,
	"out_lng" double precision,
	CONSTRAINT "shifts_name_len" CHECK (length("shifts"."name") between 3 and 120),
	CONSTRAINT "shifts_dni_len" CHECK (length("shifts"."dni") between 4 and 20)
);
--> statement-breakpoint
CREATE TABLE "sites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"lat" double precision NOT NULL,
	"lng" double precision NOT NULL,
	"radius" integer DEFAULT 150 NOT NULL,
	CONSTRAINT "sites_name_len" CHECK (length("sites"."name") between 2 and 120),
	CONSTRAINT "sites_lat_range" CHECK ("sites"."lat" between -90 and 90),
	CONSTRAINT "sites_lng_range" CHECK ("sites"."lng" between -180 and 180),
	CONSTRAINT "sites_radius_range" CHECK ("sites"."radius" between 20 and 1000)
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"name" text DEFAULT '' NOT NULL,
	"is_admin" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_email_len" CHECK (length("users"."email") between 3 and 120)
);
--> statement-breakpoint
ALTER TABLE "shifts" ADD CONSTRAINT "shifts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shifts" ADD CONSTRAINT "shifts_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "one_active_per_user" ON "shifts" USING btree ("user_id") WHERE "shifts"."status" = 'active';--> statement-breakpoint
CREATE INDEX "shifts_in_at_idx" ON "shifts" USING btree ("in_at" DESC NULLS LAST);