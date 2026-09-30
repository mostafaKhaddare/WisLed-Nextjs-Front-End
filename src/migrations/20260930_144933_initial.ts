import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_collections_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__collections_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_categories_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__categories_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_blogs_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__blogs_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_blog_post_categories_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__blog_post_categories_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_inspirations_room_type" AS ENUM('CUISINE MODERNE', 'HÔTEL LUXE', 'JARDIN & EXTÉRIEUR', 'SALLE DE SPORT', 'ENTREPÔT INDUSTRIEL', 'SALLE DE BAIN', 'SHOWROOM', 'PISCINE');
  CREATE TYPE "public"."enum_inspirations_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__inspirations_v_version_room_type" AS ENUM('CUISINE MODERNE', 'HÔTEL LUXE', 'JARDIN & EXTÉRIEUR', 'SALLE DE SPORT', 'ENTREPÔT INDUSTRIEL', 'SALLE DE BAIN', 'SHOWROOM', 'PISCINE');
  CREATE TYPE "public"."enum__inspirations_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_about_us_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__about_us_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_contact_us_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__contact_us_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_faq_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__faq_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_privacy_policy_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__privacy_policy_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_terms_and_condition_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__terms_and_condition_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alternative_text" varchar,
  	"caption" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_banner_url" varchar,
  	"sizes_banner_width" numeric,
  	"sizes_banner_height" numeric,
  	"sizes_banner_mime_type" varchar,
  	"sizes_banner_filesize" numeric,
  	"sizes_banner_filename" varchar
  );
  
  CREATE TABLE "collections" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"handle" varchar,
  	"image_id" integer,
  	"description" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_collections_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_collections_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_handle" varchar,
  	"version_image_id" integer,
  	"version_description" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__collections_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"handle" varchar,
  	"description" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_categories_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "categories_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "_categories_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_handle" varchar,
  	"version_description" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__categories_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_categories_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "blogs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"content" jsonb,
  	"featured_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_blogs_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "blogs_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"blog_post_categories_id" integer
  );
  
  CREATE TABLE "_blogs_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_content" jsonb,
  	"version_featured_image_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__blogs_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_blogs_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"blog_post_categories_id" integer
  );
  
  CREATE TABLE "blog_post_categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_blog_post_categories_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_blog_post_categories_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__blog_post_categories_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "inspirations_hotspots" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"product_handle" varchar,
  	"position_x" numeric,
  	"position_y" numeric
  );
  
  CREATE TABLE "inspirations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"room_type" "enum_inspirations_room_type",
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_inspirations_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "inspirations_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "_inspirations_v_version_hotspots" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"product_handle" varchar,
  	"position_x" numeric,
  	"position_y" numeric,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_inspirations_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_room_type" "enum__inspirations_v_version_room_type",
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__inspirations_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_inspirations_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "product_variants_colors_blocks_color_image" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "product_variants_colors_blocks_color_hex" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"color" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "product_variants_colors" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "about_us_why_us_tile" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"title" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "about_us_key_figures" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "about_us" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"our_story_title" varchar,
  	"our_story_text" varchar,
  	"our_story_image_id" integer,
  	"why_us_title" varchar,
  	"our_craftsmanship_title" varchar,
  	"our_craftsmanship_text" varchar,
  	"our_craftsmanship_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_about_us_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "about_us_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "_about_us_v_version_why_us_tile" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"title" varchar,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_about_us_v_version_key_figures" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_about_us_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_our_story_title" varchar,
  	"version_our_story_text" varchar,
  	"version_our_story_image_id" integer,
  	"version_why_us_title" varchar,
  	"version_our_craftsmanship_title" varchar,
  	"version_our_craftsmanship_text" varchar,
  	"version_our_craftsmanship_image_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__about_us_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_about_us_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"media_id" integer,
  	"collections_id" integer,
  	"categories_id" integer,
  	"blogs_id" integer,
  	"blog_post_categories_id" integer,
  	"inspirations_id" integer,
  	"product_variants_colors_id" integer,
  	"about_us_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "homepage" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_banner_headline" varchar NOT NULL,
  	"hero_banner_text" varchar,
  	"hero_banner_cta_btn_text" varchar,
  	"hero_banner_cta_btn_link" varchar,
  	"mid_banner_headline" varchar NOT NULL,
  	"mid_banner_text" varchar,
  	"mid_banner_cta_btn_text" varchar,
  	"mid_banner_cta_btn_link" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "homepage_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "contact_us_header" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "contact_us_contact_methods_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon_id" integer,
  	"title" varchar,
  	"text" varchar,
  	"link" varchar
  );
  
  CREATE TABLE "contact_us_contact_methods" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar
  );
  
  CREATE TABLE "contact_us_form_intro" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"btn_text" varchar,
  	"btn_link" varchar
  );
  
  CREATE TABLE "contact_us" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_status" "enum_contact_us_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "contact_us_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "_contact_us_v_version_header" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_contact_us_v_version_contact_methods_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon_id" integer,
  	"title" varchar,
  	"text" varchar,
  	"link" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_contact_us_v_version_contact_methods" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_contact_us_v_version_form_intro" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"btn_text" varchar,
  	"btn_link" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_contact_us_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version__status" "enum__contact_us_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_contact_us_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "faq_f_a_q_section_question" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "faq_f_a_q_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"bookmark" varchar
  );
  
  CREATE TABLE "faq" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_status" "enum_faq_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_faq_v_version_f_a_q_section_question" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_faq_v_version_f_a_q_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"bookmark" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_faq_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version__status" "enum__faq_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "privacy_policy" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"page_content" jsonb,
  	"_status" "enum_privacy_policy_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_privacy_policy_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_page_content" jsonb,
  	"version__status" "enum__privacy_policy_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "terms_and_condition" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"page_content" jsonb,
  	"_status" "enum_terms_and_condition_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_terms_and_condition_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_page_content" jsonb,
  	"version__status" "enum__terms_and_condition_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  ALTER TABLE "collections" ADD CONSTRAINT "collections_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_collections_v" ADD CONSTRAINT "_collections_v_parent_id_collections_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."collections"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_collections_v" ADD CONSTRAINT "_collections_v_version_image_id_media_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "categories_rels" ADD CONSTRAINT "categories_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "categories_rels" ADD CONSTRAINT "categories_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_categories_v" ADD CONSTRAINT "_categories_v_parent_id_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_categories_v_rels" ADD CONSTRAINT "_categories_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_categories_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_categories_v_rels" ADD CONSTRAINT "_categories_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "blogs" ADD CONSTRAINT "blogs_featured_image_id_media_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "blogs_rels" ADD CONSTRAINT "blogs_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."blogs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "blogs_rels" ADD CONSTRAINT "blogs_rels_blog_post_categories_fk" FOREIGN KEY ("blog_post_categories_id") REFERENCES "public"."blog_post_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_blogs_v" ADD CONSTRAINT "_blogs_v_parent_id_blogs_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."blogs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_blogs_v" ADD CONSTRAINT "_blogs_v_version_featured_image_id_media_id_fk" FOREIGN KEY ("version_featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_blogs_v_rels" ADD CONSTRAINT "_blogs_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_blogs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_blogs_v_rels" ADD CONSTRAINT "_blogs_v_rels_blog_post_categories_fk" FOREIGN KEY ("blog_post_categories_id") REFERENCES "public"."blog_post_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_blog_post_categories_v" ADD CONSTRAINT "_blog_post_categories_v_parent_id_blog_post_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."blog_post_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "inspirations_hotspots" ADD CONSTRAINT "inspirations_hotspots_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."inspirations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "inspirations_rels" ADD CONSTRAINT "inspirations_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."inspirations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "inspirations_rels" ADD CONSTRAINT "inspirations_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_inspirations_v_version_hotspots" ADD CONSTRAINT "_inspirations_v_version_hotspots_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_inspirations_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_inspirations_v" ADD CONSTRAINT "_inspirations_v_parent_id_inspirations_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."inspirations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_inspirations_v_rels" ADD CONSTRAINT "_inspirations_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_inspirations_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_inspirations_v_rels" ADD CONSTRAINT "_inspirations_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "product_variants_colors_blocks_color_image" ADD CONSTRAINT "product_variants_colors_blocks_color_image_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "product_variants_colors_blocks_color_image" ADD CONSTRAINT "product_variants_colors_blocks_color_image_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."product_variants_colors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "product_variants_colors_blocks_color_hex" ADD CONSTRAINT "product_variants_colors_blocks_color_hex_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."product_variants_colors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_us_why_us_tile" ADD CONSTRAINT "about_us_why_us_tile_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "about_us_why_us_tile" ADD CONSTRAINT "about_us_why_us_tile_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about_us"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_us_key_figures" ADD CONSTRAINT "about_us_key_figures_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about_us"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_us" ADD CONSTRAINT "about_us_our_story_image_id_media_id_fk" FOREIGN KEY ("our_story_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "about_us" ADD CONSTRAINT "about_us_our_craftsmanship_image_id_media_id_fk" FOREIGN KEY ("our_craftsmanship_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "about_us_rels" ADD CONSTRAINT "about_us_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."about_us"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_us_rels" ADD CONSTRAINT "about_us_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_about_us_v_version_why_us_tile" ADD CONSTRAINT "_about_us_v_version_why_us_tile_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_about_us_v_version_why_us_tile" ADD CONSTRAINT "_about_us_v_version_why_us_tile_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_about_us_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_about_us_v_version_key_figures" ADD CONSTRAINT "_about_us_v_version_key_figures_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_about_us_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_about_us_v" ADD CONSTRAINT "_about_us_v_parent_id_about_us_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."about_us"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_about_us_v" ADD CONSTRAINT "_about_us_v_version_our_story_image_id_media_id_fk" FOREIGN KEY ("version_our_story_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_about_us_v" ADD CONSTRAINT "_about_us_v_version_our_craftsmanship_image_id_media_id_fk" FOREIGN KEY ("version_our_craftsmanship_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_about_us_v_rels" ADD CONSTRAINT "_about_us_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_about_us_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_about_us_v_rels" ADD CONSTRAINT "_about_us_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_collections_fk" FOREIGN KEY ("collections_id") REFERENCES "public"."collections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_blogs_fk" FOREIGN KEY ("blogs_id") REFERENCES "public"."blogs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_blog_post_categories_fk" FOREIGN KEY ("blog_post_categories_id") REFERENCES "public"."blog_post_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_inspirations_fk" FOREIGN KEY ("inspirations_id") REFERENCES "public"."inspirations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_product_variants_colors_fk" FOREIGN KEY ("product_variants_colors_id") REFERENCES "public"."product_variants_colors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_about_us_fk" FOREIGN KEY ("about_us_id") REFERENCES "public"."about_us"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_rels" ADD CONSTRAINT "homepage_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_rels" ADD CONSTRAINT "homepage_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contact_us_header" ADD CONSTRAINT "contact_us_header_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact_us"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contact_us_contact_methods_cards" ADD CONSTRAINT "contact_us_contact_methods_cards_icon_id_media_id_fk" FOREIGN KEY ("icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "contact_us_contact_methods_cards" ADD CONSTRAINT "contact_us_contact_methods_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact_us_contact_methods"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contact_us_contact_methods" ADD CONSTRAINT "contact_us_contact_methods_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact_us"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contact_us_form_intro" ADD CONSTRAINT "contact_us_form_intro_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact_us"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contact_us_rels" ADD CONSTRAINT "contact_us_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."contact_us"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contact_us_rels" ADD CONSTRAINT "contact_us_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_contact_us_v_version_header" ADD CONSTRAINT "_contact_us_v_version_header_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_contact_us_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_contact_us_v_version_contact_methods_cards" ADD CONSTRAINT "_contact_us_v_version_contact_methods_cards_icon_id_media_id_fk" FOREIGN KEY ("icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_contact_us_v_version_contact_methods_cards" ADD CONSTRAINT "_contact_us_v_version_contact_methods_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_contact_us_v_version_contact_methods"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_contact_us_v_version_contact_methods" ADD CONSTRAINT "_contact_us_v_version_contact_methods_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_contact_us_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_contact_us_v_version_form_intro" ADD CONSTRAINT "_contact_us_v_version_form_intro_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_contact_us_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_contact_us_v_rels" ADD CONSTRAINT "_contact_us_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_contact_us_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_contact_us_v_rels" ADD CONSTRAINT "_contact_us_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "faq_f_a_q_section_question" ADD CONSTRAINT "faq_f_a_q_section_question_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."faq_f_a_q_section"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "faq_f_a_q_section" ADD CONSTRAINT "faq_f_a_q_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_faq_v_version_f_a_q_section_question" ADD CONSTRAINT "_faq_v_version_f_a_q_section_question_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_faq_v_version_f_a_q_section"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_faq_v_version_f_a_q_section" ADD CONSTRAINT "_faq_v_version_f_a_q_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_faq_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_banner_sizes_banner_filename_idx" ON "media" USING btree ("sizes_banner_filename");
  CREATE UNIQUE INDEX "collections_handle_idx" ON "collections" USING btree ("handle");
  CREATE INDEX "collections_image_idx" ON "collections" USING btree ("image_id");
  CREATE INDEX "collections_updated_at_idx" ON "collections" USING btree ("updated_at");
  CREATE INDEX "collections_created_at_idx" ON "collections" USING btree ("created_at");
  CREATE INDEX "collections__status_idx" ON "collections" USING btree ("_status");
  CREATE INDEX "_collections_v_parent_idx" ON "_collections_v" USING btree ("parent_id");
  CREATE INDEX "_collections_v_version_version_handle_idx" ON "_collections_v" USING btree ("version_handle");
  CREATE INDEX "_collections_v_version_version_image_idx" ON "_collections_v" USING btree ("version_image_id");
  CREATE INDEX "_collections_v_version_version_updated_at_idx" ON "_collections_v" USING btree ("version_updated_at");
  CREATE INDEX "_collections_v_version_version_created_at_idx" ON "_collections_v" USING btree ("version_created_at");
  CREATE INDEX "_collections_v_version_version__status_idx" ON "_collections_v" USING btree ("version__status");
  CREATE INDEX "_collections_v_created_at_idx" ON "_collections_v" USING btree ("created_at");
  CREATE INDEX "_collections_v_updated_at_idx" ON "_collections_v" USING btree ("updated_at");
  CREATE INDEX "_collections_v_latest_idx" ON "_collections_v" USING btree ("latest");
  CREATE INDEX "categories_handle_idx" ON "categories" USING btree ("handle");
  CREATE INDEX "categories_updated_at_idx" ON "categories" USING btree ("updated_at");
  CREATE INDEX "categories_created_at_idx" ON "categories" USING btree ("created_at");
  CREATE INDEX "categories__status_idx" ON "categories" USING btree ("_status");
  CREATE INDEX "categories_rels_order_idx" ON "categories_rels" USING btree ("order");
  CREATE INDEX "categories_rels_parent_idx" ON "categories_rels" USING btree ("parent_id");
  CREATE INDEX "categories_rels_path_idx" ON "categories_rels" USING btree ("path");
  CREATE INDEX "categories_rels_media_id_idx" ON "categories_rels" USING btree ("media_id");
  CREATE INDEX "_categories_v_parent_idx" ON "_categories_v" USING btree ("parent_id");
  CREATE INDEX "_categories_v_version_version_handle_idx" ON "_categories_v" USING btree ("version_handle");
  CREATE INDEX "_categories_v_version_version_updated_at_idx" ON "_categories_v" USING btree ("version_updated_at");
  CREATE INDEX "_categories_v_version_version_created_at_idx" ON "_categories_v" USING btree ("version_created_at");
  CREATE INDEX "_categories_v_version_version__status_idx" ON "_categories_v" USING btree ("version__status");
  CREATE INDEX "_categories_v_created_at_idx" ON "_categories_v" USING btree ("created_at");
  CREATE INDEX "_categories_v_updated_at_idx" ON "_categories_v" USING btree ("updated_at");
  CREATE INDEX "_categories_v_latest_idx" ON "_categories_v" USING btree ("latest");
  CREATE INDEX "_categories_v_rels_order_idx" ON "_categories_v_rels" USING btree ("order");
  CREATE INDEX "_categories_v_rels_parent_idx" ON "_categories_v_rels" USING btree ("parent_id");
  CREATE INDEX "_categories_v_rels_path_idx" ON "_categories_v_rels" USING btree ("path");
  CREATE INDEX "_categories_v_rels_media_id_idx" ON "_categories_v_rels" USING btree ("media_id");
  CREATE UNIQUE INDEX "blogs_slug_idx" ON "blogs" USING btree ("slug");
  CREATE INDEX "blogs_featured_image_idx" ON "blogs" USING btree ("featured_image_id");
  CREATE INDEX "blogs_updated_at_idx" ON "blogs" USING btree ("updated_at");
  CREATE INDEX "blogs_created_at_idx" ON "blogs" USING btree ("created_at");
  CREATE INDEX "blogs__status_idx" ON "blogs" USING btree ("_status");
  CREATE INDEX "blogs_rels_order_idx" ON "blogs_rels" USING btree ("order");
  CREATE INDEX "blogs_rels_parent_idx" ON "blogs_rels" USING btree ("parent_id");
  CREATE INDEX "blogs_rels_path_idx" ON "blogs_rels" USING btree ("path");
  CREATE INDEX "blogs_rels_blog_post_categories_id_idx" ON "blogs_rels" USING btree ("blog_post_categories_id");
  CREATE INDEX "_blogs_v_parent_idx" ON "_blogs_v" USING btree ("parent_id");
  CREATE INDEX "_blogs_v_version_version_slug_idx" ON "_blogs_v" USING btree ("version_slug");
  CREATE INDEX "_blogs_v_version_version_featured_image_idx" ON "_blogs_v" USING btree ("version_featured_image_id");
  CREATE INDEX "_blogs_v_version_version_updated_at_idx" ON "_blogs_v" USING btree ("version_updated_at");
  CREATE INDEX "_blogs_v_version_version_created_at_idx" ON "_blogs_v" USING btree ("version_created_at");
  CREATE INDEX "_blogs_v_version_version__status_idx" ON "_blogs_v" USING btree ("version__status");
  CREATE INDEX "_blogs_v_created_at_idx" ON "_blogs_v" USING btree ("created_at");
  CREATE INDEX "_blogs_v_updated_at_idx" ON "_blogs_v" USING btree ("updated_at");
  CREATE INDEX "_blogs_v_latest_idx" ON "_blogs_v" USING btree ("latest");
  CREATE INDEX "_blogs_v_rels_order_idx" ON "_blogs_v_rels" USING btree ("order");
  CREATE INDEX "_blogs_v_rels_parent_idx" ON "_blogs_v_rels" USING btree ("parent_id");
  CREATE INDEX "_blogs_v_rels_path_idx" ON "_blogs_v_rels" USING btree ("path");
  CREATE INDEX "_blogs_v_rels_blog_post_categories_id_idx" ON "_blogs_v_rels" USING btree ("blog_post_categories_id");
  CREATE UNIQUE INDEX "blog_post_categories_slug_idx" ON "blog_post_categories" USING btree ("slug");
  CREATE INDEX "blog_post_categories_updated_at_idx" ON "blog_post_categories" USING btree ("updated_at");
  CREATE INDEX "blog_post_categories_created_at_idx" ON "blog_post_categories" USING btree ("created_at");
  CREATE INDEX "blog_post_categories__status_idx" ON "blog_post_categories" USING btree ("_status");
  CREATE INDEX "_blog_post_categories_v_parent_idx" ON "_blog_post_categories_v" USING btree ("parent_id");
  CREATE INDEX "_blog_post_categories_v_version_version_slug_idx" ON "_blog_post_categories_v" USING btree ("version_slug");
  CREATE INDEX "_blog_post_categories_v_version_version_updated_at_idx" ON "_blog_post_categories_v" USING btree ("version_updated_at");
  CREATE INDEX "_blog_post_categories_v_version_version_created_at_idx" ON "_blog_post_categories_v" USING btree ("version_created_at");
  CREATE INDEX "_blog_post_categories_v_version_version__status_idx" ON "_blog_post_categories_v" USING btree ("version__status");
  CREATE INDEX "_blog_post_categories_v_created_at_idx" ON "_blog_post_categories_v" USING btree ("created_at");
  CREATE INDEX "_blog_post_categories_v_updated_at_idx" ON "_blog_post_categories_v" USING btree ("updated_at");
  CREATE INDEX "_blog_post_categories_v_latest_idx" ON "_blog_post_categories_v" USING btree ("latest");
  CREATE INDEX "inspirations_hotspots_order_idx" ON "inspirations_hotspots" USING btree ("_order");
  CREATE INDEX "inspirations_hotspots_parent_id_idx" ON "inspirations_hotspots" USING btree ("_parent_id");
  CREATE INDEX "inspirations_updated_at_idx" ON "inspirations" USING btree ("updated_at");
  CREATE INDEX "inspirations_created_at_idx" ON "inspirations" USING btree ("created_at");
  CREATE INDEX "inspirations__status_idx" ON "inspirations" USING btree ("_status");
  CREATE INDEX "inspirations_rels_order_idx" ON "inspirations_rels" USING btree ("order");
  CREATE INDEX "inspirations_rels_parent_idx" ON "inspirations_rels" USING btree ("parent_id");
  CREATE INDEX "inspirations_rels_path_idx" ON "inspirations_rels" USING btree ("path");
  CREATE INDEX "inspirations_rels_media_id_idx" ON "inspirations_rels" USING btree ("media_id");
  CREATE INDEX "_inspirations_v_version_hotspots_order_idx" ON "_inspirations_v_version_hotspots" USING btree ("_order");
  CREATE INDEX "_inspirations_v_version_hotspots_parent_id_idx" ON "_inspirations_v_version_hotspots" USING btree ("_parent_id");
  CREATE INDEX "_inspirations_v_parent_idx" ON "_inspirations_v" USING btree ("parent_id");
  CREATE INDEX "_inspirations_v_version_version_updated_at_idx" ON "_inspirations_v" USING btree ("version_updated_at");
  CREATE INDEX "_inspirations_v_version_version_created_at_idx" ON "_inspirations_v" USING btree ("version_created_at");
  CREATE INDEX "_inspirations_v_version_version__status_idx" ON "_inspirations_v" USING btree ("version__status");
  CREATE INDEX "_inspirations_v_created_at_idx" ON "_inspirations_v" USING btree ("created_at");
  CREATE INDEX "_inspirations_v_updated_at_idx" ON "_inspirations_v" USING btree ("updated_at");
  CREATE INDEX "_inspirations_v_latest_idx" ON "_inspirations_v" USING btree ("latest");
  CREATE INDEX "_inspirations_v_rels_order_idx" ON "_inspirations_v_rels" USING btree ("order");
  CREATE INDEX "_inspirations_v_rels_parent_idx" ON "_inspirations_v_rels" USING btree ("parent_id");
  CREATE INDEX "_inspirations_v_rels_path_idx" ON "_inspirations_v_rels" USING btree ("path");
  CREATE INDEX "_inspirations_v_rels_media_id_idx" ON "_inspirations_v_rels" USING btree ("media_id");
  CREATE INDEX "product_variants_colors_blocks_color_image_order_idx" ON "product_variants_colors_blocks_color_image" USING btree ("_order");
  CREATE INDEX "product_variants_colors_blocks_color_image_parent_id_idx" ON "product_variants_colors_blocks_color_image" USING btree ("_parent_id");
  CREATE INDEX "product_variants_colors_blocks_color_image_path_idx" ON "product_variants_colors_blocks_color_image" USING btree ("_path");
  CREATE INDEX "product_variants_colors_blocks_color_image_image_idx" ON "product_variants_colors_blocks_color_image" USING btree ("image_id");
  CREATE INDEX "product_variants_colors_blocks_color_hex_order_idx" ON "product_variants_colors_blocks_color_hex" USING btree ("_order");
  CREATE INDEX "product_variants_colors_blocks_color_hex_parent_id_idx" ON "product_variants_colors_blocks_color_hex" USING btree ("_parent_id");
  CREATE INDEX "product_variants_colors_blocks_color_hex_path_idx" ON "product_variants_colors_blocks_color_hex" USING btree ("_path");
  CREATE INDEX "product_variants_colors_updated_at_idx" ON "product_variants_colors" USING btree ("updated_at");
  CREATE INDEX "product_variants_colors_created_at_idx" ON "product_variants_colors" USING btree ("created_at");
  CREATE INDEX "about_us_why_us_tile_order_idx" ON "about_us_why_us_tile" USING btree ("_order");
  CREATE INDEX "about_us_why_us_tile_parent_id_idx" ON "about_us_why_us_tile" USING btree ("_parent_id");
  CREATE INDEX "about_us_why_us_tile_image_idx" ON "about_us_why_us_tile" USING btree ("image_id");
  CREATE INDEX "about_us_key_figures_order_idx" ON "about_us_key_figures" USING btree ("_order");
  CREATE INDEX "about_us_key_figures_parent_id_idx" ON "about_us_key_figures" USING btree ("_parent_id");
  CREATE INDEX "about_us_our_story_our_story_image_idx" ON "about_us" USING btree ("our_story_image_id");
  CREATE INDEX "about_us_our_craftsmanship_our_craftsmanship_image_idx" ON "about_us" USING btree ("our_craftsmanship_image_id");
  CREATE INDEX "about_us_updated_at_idx" ON "about_us" USING btree ("updated_at");
  CREATE INDEX "about_us_created_at_idx" ON "about_us" USING btree ("created_at");
  CREATE INDEX "about_us__status_idx" ON "about_us" USING btree ("_status");
  CREATE INDEX "about_us_rels_order_idx" ON "about_us_rels" USING btree ("order");
  CREATE INDEX "about_us_rels_parent_idx" ON "about_us_rels" USING btree ("parent_id");
  CREATE INDEX "about_us_rels_path_idx" ON "about_us_rels" USING btree ("path");
  CREATE INDEX "about_us_rels_media_id_idx" ON "about_us_rels" USING btree ("media_id");
  CREATE INDEX "_about_us_v_version_why_us_tile_order_idx" ON "_about_us_v_version_why_us_tile" USING btree ("_order");
  CREATE INDEX "_about_us_v_version_why_us_tile_parent_id_idx" ON "_about_us_v_version_why_us_tile" USING btree ("_parent_id");
  CREATE INDEX "_about_us_v_version_why_us_tile_image_idx" ON "_about_us_v_version_why_us_tile" USING btree ("image_id");
  CREATE INDEX "_about_us_v_version_key_figures_order_idx" ON "_about_us_v_version_key_figures" USING btree ("_order");
  CREATE INDEX "_about_us_v_version_key_figures_parent_id_idx" ON "_about_us_v_version_key_figures" USING btree ("_parent_id");
  CREATE INDEX "_about_us_v_parent_idx" ON "_about_us_v" USING btree ("parent_id");
  CREATE INDEX "_about_us_v_version_our_story_version_our_story_image_idx" ON "_about_us_v" USING btree ("version_our_story_image_id");
  CREATE INDEX "_about_us_v_version_our_craftsmanship_version_our_craftsmanship_image_idx" ON "_about_us_v" USING btree ("version_our_craftsmanship_image_id");
  CREATE INDEX "_about_us_v_version_version_updated_at_idx" ON "_about_us_v" USING btree ("version_updated_at");
  CREATE INDEX "_about_us_v_version_version_created_at_idx" ON "_about_us_v" USING btree ("version_created_at");
  CREATE INDEX "_about_us_v_version_version__status_idx" ON "_about_us_v" USING btree ("version__status");
  CREATE INDEX "_about_us_v_created_at_idx" ON "_about_us_v" USING btree ("created_at");
  CREATE INDEX "_about_us_v_updated_at_idx" ON "_about_us_v" USING btree ("updated_at");
  CREATE INDEX "_about_us_v_latest_idx" ON "_about_us_v" USING btree ("latest");
  CREATE INDEX "_about_us_v_rels_order_idx" ON "_about_us_v_rels" USING btree ("order");
  CREATE INDEX "_about_us_v_rels_parent_idx" ON "_about_us_v_rels" USING btree ("parent_id");
  CREATE INDEX "_about_us_v_rels_path_idx" ON "_about_us_v_rels" USING btree ("path");
  CREATE INDEX "_about_us_v_rels_media_id_idx" ON "_about_us_v_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_collections_id_idx" ON "payload_locked_documents_rels" USING btree ("collections_id");
  CREATE INDEX "payload_locked_documents_rels_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("categories_id");
  CREATE INDEX "payload_locked_documents_rels_blogs_id_idx" ON "payload_locked_documents_rels" USING btree ("blogs_id");
  CREATE INDEX "payload_locked_documents_rels_blog_post_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("blog_post_categories_id");
  CREATE INDEX "payload_locked_documents_rels_inspirations_id_idx" ON "payload_locked_documents_rels" USING btree ("inspirations_id");
  CREATE INDEX "payload_locked_documents_rels_product_variants_colors_id_idx" ON "payload_locked_documents_rels" USING btree ("product_variants_colors_id");
  CREATE INDEX "payload_locked_documents_rels_about_us_id_idx" ON "payload_locked_documents_rels" USING btree ("about_us_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "homepage_rels_order_idx" ON "homepage_rels" USING btree ("order");
  CREATE INDEX "homepage_rels_parent_idx" ON "homepage_rels" USING btree ("parent_id");
  CREATE INDEX "homepage_rels_path_idx" ON "homepage_rels" USING btree ("path");
  CREATE INDEX "homepage_rels_media_id_idx" ON "homepage_rels" USING btree ("media_id");
  CREATE INDEX "contact_us_header_order_idx" ON "contact_us_header" USING btree ("_order");
  CREATE INDEX "contact_us_header_parent_id_idx" ON "contact_us_header" USING btree ("_parent_id");
  CREATE INDEX "contact_us_contact_methods_cards_order_idx" ON "contact_us_contact_methods_cards" USING btree ("_order");
  CREATE INDEX "contact_us_contact_methods_cards_parent_id_idx" ON "contact_us_contact_methods_cards" USING btree ("_parent_id");
  CREATE INDEX "contact_us_contact_methods_cards_icon_idx" ON "contact_us_contact_methods_cards" USING btree ("icon_id");
  CREATE INDEX "contact_us_contact_methods_order_idx" ON "contact_us_contact_methods" USING btree ("_order");
  CREATE INDEX "contact_us_contact_methods_parent_id_idx" ON "contact_us_contact_methods" USING btree ("_parent_id");
  CREATE INDEX "contact_us_form_intro_order_idx" ON "contact_us_form_intro" USING btree ("_order");
  CREATE INDEX "contact_us_form_intro_parent_id_idx" ON "contact_us_form_intro" USING btree ("_parent_id");
  CREATE INDEX "contact_us__status_idx" ON "contact_us" USING btree ("_status");
  CREATE INDEX "contact_us_rels_order_idx" ON "contact_us_rels" USING btree ("order");
  CREATE INDEX "contact_us_rels_parent_idx" ON "contact_us_rels" USING btree ("parent_id");
  CREATE INDEX "contact_us_rels_path_idx" ON "contact_us_rels" USING btree ("path");
  CREATE INDEX "contact_us_rels_media_id_idx" ON "contact_us_rels" USING btree ("media_id");
  CREATE INDEX "_contact_us_v_version_header_order_idx" ON "_contact_us_v_version_header" USING btree ("_order");
  CREATE INDEX "_contact_us_v_version_header_parent_id_idx" ON "_contact_us_v_version_header" USING btree ("_parent_id");
  CREATE INDEX "_contact_us_v_version_contact_methods_cards_order_idx" ON "_contact_us_v_version_contact_methods_cards" USING btree ("_order");
  CREATE INDEX "_contact_us_v_version_contact_methods_cards_parent_id_idx" ON "_contact_us_v_version_contact_methods_cards" USING btree ("_parent_id");
  CREATE INDEX "_contact_us_v_version_contact_methods_cards_icon_idx" ON "_contact_us_v_version_contact_methods_cards" USING btree ("icon_id");
  CREATE INDEX "_contact_us_v_version_contact_methods_order_idx" ON "_contact_us_v_version_contact_methods" USING btree ("_order");
  CREATE INDEX "_contact_us_v_version_contact_methods_parent_id_idx" ON "_contact_us_v_version_contact_methods" USING btree ("_parent_id");
  CREATE INDEX "_contact_us_v_version_form_intro_order_idx" ON "_contact_us_v_version_form_intro" USING btree ("_order");
  CREATE INDEX "_contact_us_v_version_form_intro_parent_id_idx" ON "_contact_us_v_version_form_intro" USING btree ("_parent_id");
  CREATE INDEX "_contact_us_v_version_version__status_idx" ON "_contact_us_v" USING btree ("version__status");
  CREATE INDEX "_contact_us_v_created_at_idx" ON "_contact_us_v" USING btree ("created_at");
  CREATE INDEX "_contact_us_v_updated_at_idx" ON "_contact_us_v" USING btree ("updated_at");
  CREATE INDEX "_contact_us_v_latest_idx" ON "_contact_us_v" USING btree ("latest");
  CREATE INDEX "_contact_us_v_rels_order_idx" ON "_contact_us_v_rels" USING btree ("order");
  CREATE INDEX "_contact_us_v_rels_parent_idx" ON "_contact_us_v_rels" USING btree ("parent_id");
  CREATE INDEX "_contact_us_v_rels_path_idx" ON "_contact_us_v_rels" USING btree ("path");
  CREATE INDEX "_contact_us_v_rels_media_id_idx" ON "_contact_us_v_rels" USING btree ("media_id");
  CREATE INDEX "faq_f_a_q_section_question_order_idx" ON "faq_f_a_q_section_question" USING btree ("_order");
  CREATE INDEX "faq_f_a_q_section_question_parent_id_idx" ON "faq_f_a_q_section_question" USING btree ("_parent_id");
  CREATE INDEX "faq_f_a_q_section_order_idx" ON "faq_f_a_q_section" USING btree ("_order");
  CREATE INDEX "faq_f_a_q_section_parent_id_idx" ON "faq_f_a_q_section" USING btree ("_parent_id");
  CREATE INDEX "faq__status_idx" ON "faq" USING btree ("_status");
  CREATE INDEX "_faq_v_version_f_a_q_section_question_order_idx" ON "_faq_v_version_f_a_q_section_question" USING btree ("_order");
  CREATE INDEX "_faq_v_version_f_a_q_section_question_parent_id_idx" ON "_faq_v_version_f_a_q_section_question" USING btree ("_parent_id");
  CREATE INDEX "_faq_v_version_f_a_q_section_order_idx" ON "_faq_v_version_f_a_q_section" USING btree ("_order");
  CREATE INDEX "_faq_v_version_f_a_q_section_parent_id_idx" ON "_faq_v_version_f_a_q_section" USING btree ("_parent_id");
  CREATE INDEX "_faq_v_version_version__status_idx" ON "_faq_v" USING btree ("version__status");
  CREATE INDEX "_faq_v_created_at_idx" ON "_faq_v" USING btree ("created_at");
  CREATE INDEX "_faq_v_updated_at_idx" ON "_faq_v" USING btree ("updated_at");
  CREATE INDEX "_faq_v_latest_idx" ON "_faq_v" USING btree ("latest");
  CREATE INDEX "privacy_policy__status_idx" ON "privacy_policy" USING btree ("_status");
  CREATE INDEX "_privacy_policy_v_version_version__status_idx" ON "_privacy_policy_v" USING btree ("version__status");
  CREATE INDEX "_privacy_policy_v_created_at_idx" ON "_privacy_policy_v" USING btree ("created_at");
  CREATE INDEX "_privacy_policy_v_updated_at_idx" ON "_privacy_policy_v" USING btree ("updated_at");
  CREATE INDEX "_privacy_policy_v_latest_idx" ON "_privacy_policy_v" USING btree ("latest");
  CREATE INDEX "terms_and_condition__status_idx" ON "terms_and_condition" USING btree ("_status");
  CREATE INDEX "_terms_and_condition_v_version_version__status_idx" ON "_terms_and_condition_v" USING btree ("version__status");
  CREATE INDEX "_terms_and_condition_v_created_at_idx" ON "_terms_and_condition_v" USING btree ("created_at");
  CREATE INDEX "_terms_and_condition_v_updated_at_idx" ON "_terms_and_condition_v" USING btree ("updated_at");
  CREATE INDEX "_terms_and_condition_v_latest_idx" ON "_terms_and_condition_v" USING btree ("latest");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "collections" CASCADE;
  DROP TABLE "_collections_v" CASCADE;
  DROP TABLE "categories" CASCADE;
  DROP TABLE "categories_rels" CASCADE;
  DROP TABLE "_categories_v" CASCADE;
  DROP TABLE "_categories_v_rels" CASCADE;
  DROP TABLE "blogs" CASCADE;
  DROP TABLE "blogs_rels" CASCADE;
  DROP TABLE "_blogs_v" CASCADE;
  DROP TABLE "_blogs_v_rels" CASCADE;
  DROP TABLE "blog_post_categories" CASCADE;
  DROP TABLE "_blog_post_categories_v" CASCADE;
  DROP TABLE "inspirations_hotspots" CASCADE;
  DROP TABLE "inspirations" CASCADE;
  DROP TABLE "inspirations_rels" CASCADE;
  DROP TABLE "_inspirations_v_version_hotspots" CASCADE;
  DROP TABLE "_inspirations_v" CASCADE;
  DROP TABLE "_inspirations_v_rels" CASCADE;
  DROP TABLE "product_variants_colors_blocks_color_image" CASCADE;
  DROP TABLE "product_variants_colors_blocks_color_hex" CASCADE;
  DROP TABLE "product_variants_colors" CASCADE;
  DROP TABLE "about_us_why_us_tile" CASCADE;
  DROP TABLE "about_us_key_figures" CASCADE;
  DROP TABLE "about_us" CASCADE;
  DROP TABLE "about_us_rels" CASCADE;
  DROP TABLE "_about_us_v_version_why_us_tile" CASCADE;
  DROP TABLE "_about_us_v_version_key_figures" CASCADE;
  DROP TABLE "_about_us_v" CASCADE;
  DROP TABLE "_about_us_v_rels" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "homepage" CASCADE;
  DROP TABLE "homepage_rels" CASCADE;
  DROP TABLE "contact_us_header" CASCADE;
  DROP TABLE "contact_us_contact_methods_cards" CASCADE;
  DROP TABLE "contact_us_contact_methods" CASCADE;
  DROP TABLE "contact_us_form_intro" CASCADE;
  DROP TABLE "contact_us" CASCADE;
  DROP TABLE "contact_us_rels" CASCADE;
  DROP TABLE "_contact_us_v_version_header" CASCADE;
  DROP TABLE "_contact_us_v_version_contact_methods_cards" CASCADE;
  DROP TABLE "_contact_us_v_version_contact_methods" CASCADE;
  DROP TABLE "_contact_us_v_version_form_intro" CASCADE;
  DROP TABLE "_contact_us_v" CASCADE;
  DROP TABLE "_contact_us_v_rels" CASCADE;
  DROP TABLE "faq_f_a_q_section_question" CASCADE;
  DROP TABLE "faq_f_a_q_section" CASCADE;
  DROP TABLE "faq" CASCADE;
  DROP TABLE "_faq_v_version_f_a_q_section_question" CASCADE;
  DROP TABLE "_faq_v_version_f_a_q_section" CASCADE;
  DROP TABLE "_faq_v" CASCADE;
  DROP TABLE "privacy_policy" CASCADE;
  DROP TABLE "_privacy_policy_v" CASCADE;
  DROP TABLE "terms_and_condition" CASCADE;
  DROP TABLE "_terms_and_condition_v" CASCADE;
  DROP TYPE "public"."enum_collections_status";
  DROP TYPE "public"."enum__collections_v_version_status";
  DROP TYPE "public"."enum_categories_status";
  DROP TYPE "public"."enum__categories_v_version_status";
  DROP TYPE "public"."enum_blogs_status";
  DROP TYPE "public"."enum__blogs_v_version_status";
  DROP TYPE "public"."enum_blog_post_categories_status";
  DROP TYPE "public"."enum__blog_post_categories_v_version_status";
  DROP TYPE "public"."enum_inspirations_room_type";
  DROP TYPE "public"."enum_inspirations_status";
  DROP TYPE "public"."enum__inspirations_v_version_room_type";
  DROP TYPE "public"."enum__inspirations_v_version_status";
  DROP TYPE "public"."enum_about_us_status";
  DROP TYPE "public"."enum__about_us_v_version_status";
  DROP TYPE "public"."enum_contact_us_status";
  DROP TYPE "public"."enum__contact_us_v_version_status";
  DROP TYPE "public"."enum_faq_status";
  DROP TYPE "public"."enum__faq_v_version_status";
  DROP TYPE "public"."enum_privacy_policy_status";
  DROP TYPE "public"."enum__privacy_policy_v_version_status";
  DROP TYPE "public"."enum_terms_and_condition_status";
  DROP TYPE "public"."enum__terms_and_condition_v_version_status";`)
}
