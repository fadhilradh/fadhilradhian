CREATE TYPE "public"."alert_frequency" AS ENUM('off', 'daily', 'weekly');--> statement-breakpoint
CREATE TYPE "public"."api_type" AS ENUM('API-U', 'API-P');--> statement-breakpoint
CREATE TYPE "public"."currency" AS ENUM('IDR', 'USD');--> statement-breakpoint
CREATE TYPE "public"."document_kind" AS ENUM('nib', 'npwp', 'api', 'customs_nik', 'akta', 'other');--> statement-breakpoint
CREATE TYPE "public"."document_status" AS ENUM('pending', 'approved', 'rejected', 'expired');--> statement-breakpoint
CREATE TYPE "public"."entity_type" AS ENUM('PT', 'CV', 'UD', 'Koperasi', 'Perorangan');--> statement-breakpoint
CREATE TYPE "public"."incoterm" AS ENUM('EXW', 'FCA', 'FOB', 'CFR', 'CIF', 'DDP');--> statement-breakpoint
CREATE TYPE "public"."inquiry_status" AS ENUM('open', 'accepted', 'quoted', 'closed');--> statement-breakpoint
CREATE TYPE "public"."lane" AS ENUM('green', 'amber', 'red');--> statement-breakpoint
CREATE TYPE "public"."listing_kind" AS ENUM('offer', 'request');--> statement-breakpoint
CREATE TYPE "public"."listing_status" AS ENUM('draft', 'active', 'paused', 'expired', 'removed');--> statement-breakpoint
CREATE TYPE "public"."locale" AS ENUM('id', 'en');--> statement-breakpoint
CREATE TYPE "public"."member_role" AS ENUM('owner', 'admin', 'staff');--> statement-breakpoint
CREATE TYPE "public"."port_type" AS ENUM('sea', 'air', 'dry');--> statement-breakpoint
CREATE TYPE "public"."report_status" AS ENUM('open', 'actioned', 'dismissed');--> statement-breakpoint
CREATE TYPE "public"."unit" AS ENUM('KG', 'MT', 'TEU', 'CBM', 'PCS', 'LITER');--> statement-breakpoint
CREATE TYPE "public"."verification_source" AS ENUM('manual', 'oss_api');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"token" text NOT NULL,
	"user_id" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"locale" "locale" DEFAULT 'id' NOT NULL,
	"is_admin" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "companies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"legal_name" text NOT NULL,
	"brand_name" text NOT NULL,
	"nib" text,
	"npwp" text,
	"api_type" "api_type",
	"customs_nik" text,
	"entity_type" "entity_type",
	"province" text,
	"city" text,
	"address" text,
	"website" text,
	"phone" text,
	"about_id" text,
	"about_en" text,
	"employee_range" text,
	"year_established" integer,
	"verification_lane" "lane" DEFAULT 'red' NOT NULL,
	"verification_source" "verification_source" DEFAULT 'manual' NOT NULL,
	"verified_at" timestamp with time zone,
	"verified_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "company_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"kind" "document_kind" NOT NULL,
	"r2_key" text NOT NULL,
	"file_name" text,
	"byte_size" integer,
	"status" "document_status" DEFAULT 'pending' NOT NULL,
	"reviewer_note" text,
	"reviewed_at" timestamp with time zone,
	"reviewed_by" text,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "company_members" (
	"company_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"role" "member_role" DEFAULT 'staff' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "company_members_company_id_user_id_pk" PRIMARY KEY("company_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" text PRIMARY KEY NOT NULL,
	"parent_id" text,
	"name_id" text NOT NULL,
	"name_en" text NOT NULL,
	"sort" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hs_codes" (
	"code" text PRIMARY KEY NOT NULL,
	"chapter" text NOT NULL,
	"heading" text NOT NULL,
	"description_id" text NOT NULL,
	"description_en" text NOT NULL,
	"lartas" jsonb,
	"duty_note" text
);
--> statement-breakpoint
CREATE TABLE "listing_media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"listing_id" uuid NOT NULL,
	"r2_key" text NOT NULL,
	"width" integer,
	"height" integer,
	"sort" integer DEFAULT 0 NOT NULL,
	"alt" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "listing_views" (
	"listing_id" uuid NOT NULL,
	"day" date NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "listing_views_listing_id_day_pk" PRIMARY KEY("listing_id","day")
);
--> statement-breakpoint
CREATE TABLE "listings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"kind" "listing_kind" NOT NULL,
	"title_id" text NOT NULL,
	"title_en" text,
	"description_id" text,
	"description_en" text,
	"hs_code" text NOT NULL,
	"category_id" text,
	"quantity" numeric(14, 2),
	"unit" "unit",
	"moq" numeric(14, 2),
	"moq_unit" "unit",
	"capacity_per_month" numeric(14, 2),
	"price_min" numeric(14, 2),
	"price_max" numeric(14, 2),
	"currency" "currency",
	"price_basis" text,
	"incoterm" "incoterm",
	"origin_port" text,
	"destination_port" text,
	"lead_time_days" integer,
	"certifications" text[] DEFAULT '{}'::text[] NOT NULL,
	"packaging_note" text,
	"status" "listing_status" DEFAULT 'draft' NOT NULL,
	"published_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"search_vector" "tsvector" GENERATED ALWAYS AS (
        setweight(to_tsvector('simple', immutable_unaccent(coalesce("listings"."title_id", '') || ' ' || coalesce("listings"."title_en", ''))), 'A') ||
        setweight(to_tsvector('simple', immutable_unaccent(coalesce("listings"."description_id", '') || ' ' || coalesce("listings"."description_en", ''))), 'B') ||
        setweight(to_tsvector('simple', coalesce("listings"."hs_code", '')), 'C')
      ) STORED
);
--> statement-breakpoint
CREATE TABLE "ports" (
	"unlocode" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"province" text NOT NULL,
	"type" "port_type" DEFAULT 'sea' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_user_id" text,
	"action" text NOT NULL,
	"target" text NOT NULL,
	"diff" jsonb,
	"ip" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "favorites" (
	"user_id" text NOT NULL,
	"listing_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "favorites_user_id_listing_id_pk" PRIMARY KEY("user_id","listing_id")
);
--> statement-breakpoint
CREATE TABLE "inquiries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"listing_id" uuid NOT NULL,
	"from_company_id" uuid NOT NULL,
	"to_company_id" uuid NOT NULL,
	"status" "inquiry_status" DEFAULT 'open' NOT NULL,
	"accepted_at" timestamp with time zone,
	"closed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"inquiry_id" uuid NOT NULL,
	"sender_user_id" text NOT NULL,
	"body" text NOT NULL,
	"attachments" jsonb,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"target_type" text NOT NULL,
	"target_id" text NOT NULL,
	"reporter_user_id" text,
	"reason" text NOT NULL,
	"notes" text,
	"status" "report_status" DEFAULT 'open' NOT NULL,
	"resolved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saved_searches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"label" text NOT NULL,
	"query" jsonb NOT NULL,
	"alert_frequency" "alert_frequency" DEFAULT 'off' NOT NULL,
	"last_notified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "companies" ADD CONSTRAINT "companies_verified_by_user_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_documents" ADD CONSTRAINT "company_documents_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_documents" ADD CONSTRAINT "company_documents_reviewed_by_user_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_members" ADD CONSTRAINT "company_members_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_members" ADD CONSTRAINT "company_members_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_media" ADD CONSTRAINT "listing_media_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_views" ADD CONSTRAINT "listing_views_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_hs_code_hs_codes_code_fk" FOREIGN KEY ("hs_code") REFERENCES "public"."hs_codes"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_origin_port_ports_unlocode_fk" FOREIGN KEY ("origin_port") REFERENCES "public"."ports"("unlocode") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_destination_port_ports_unlocode_fk" FOREIGN KEY ("destination_port") REFERENCES "public"."ports"("unlocode") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_actor_user_id_user_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_from_company_id_companies_id_fk" FOREIGN KEY ("from_company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_to_company_id_companies_id_fk" FOREIGN KEY ("to_company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_inquiry_id_inquiries_id_fk" FOREIGN KEY ("inquiry_id") REFERENCES "public"."inquiries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_user_id_user_id_fk" FOREIGN KEY ("sender_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporter_user_id_user_id_fk" FOREIGN KEY ("reporter_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_searches" ADD CONSTRAINT "saved_searches_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_user_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_user_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_email_idx" ON "user" USING btree ("email");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE UNIQUE INDEX "companies_slug_key" ON "companies" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "companies_nib_key" ON "companies" USING btree ("nib") WHERE "companies"."nib" is not null;--> statement-breakpoint
CREATE INDEX "companies_lane_idx" ON "companies" USING btree ("verification_lane");--> statement-breakpoint
CREATE INDEX "companies_province_idx" ON "companies" USING btree ("province");--> statement-breakpoint
CREATE INDEX "company_documents_company_idx" ON "company_documents" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "company_documents_status_idx" ON "company_documents" USING btree ("status");--> statement-breakpoint
CREATE INDEX "company_members_user_idx" ON "company_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "categories_parent_idx" ON "categories" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "hs_codes_chapter_idx" ON "hs_codes" USING btree ("chapter");--> statement-breakpoint
CREATE INDEX "hs_codes_desc_id_trgm" ON "hs_codes" USING gin ("description_id" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "hs_codes_desc_en_trgm" ON "hs_codes" USING gin ("description_en" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "listing_media_listing_idx" ON "listing_media" USING btree ("listing_id","sort");--> statement-breakpoint
CREATE INDEX "listings_search_idx" ON "listings" USING gin ("search_vector");--> statement-breakpoint
CREATE INDEX "listings_feed_idx" ON "listings" USING btree ("status","kind","published_at" DESC NULLS LAST,"id" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "listings_company_idx" ON "listings" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "listings_hs_idx" ON "listings" USING btree ("hs_code");--> statement-breakpoint
CREATE INDEX "listings_origin_port_idx" ON "listings" USING btree ("origin_port");--> statement-breakpoint
CREATE INDEX "listings_expiry_idx" ON "listings" USING btree ("expires_at") WHERE "listings"."status" = 'active';--> statement-breakpoint
CREATE INDEX "ports_province_idx" ON "ports" USING btree ("province");--> statement-breakpoint
CREATE INDEX "audit_log_target_idx" ON "audit_log" USING btree ("target");--> statement-breakpoint
CREATE INDEX "audit_log_created_idx" ON "audit_log" USING btree ("created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "inquiries_to_company_idx" ON "inquiries" USING btree ("to_company_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "inquiries_from_company_idx" ON "inquiries" USING btree ("from_company_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "inquiries_listing_idx" ON "inquiries" USING btree ("listing_id");--> statement-breakpoint
CREATE INDEX "messages_inquiry_idx" ON "messages" USING btree ("inquiry_id","created_at");--> statement-breakpoint
CREATE INDEX "reports_target_idx" ON "reports" USING btree ("target_type","target_id");--> statement-breakpoint
CREATE INDEX "reports_status_idx" ON "reports" USING btree ("status");--> statement-breakpoint
CREATE INDEX "saved_searches_user_idx" ON "saved_searches" USING btree ("user_id");