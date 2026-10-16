import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "homepage_hero_banner_slides" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL,
  	"headline" varchar NOT NULL,
  	"text" varchar,
  	"btn_text" varchar,
  	"btn_link" varchar
  );
  
  ALTER TABLE "homepage_hero_banner_slides" ADD CONSTRAINT "homepage_hero_banner_slides_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_hero_banner_slides" ADD CONSTRAINT "homepage_hero_banner_slides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "homepage_hero_banner_slides_order_idx" ON "homepage_hero_banner_slides" USING btree ("_order");
  CREATE INDEX "homepage_hero_banner_slides_parent_id_idx" ON "homepage_hero_banner_slides" USING btree ("_parent_id");
  CREATE INDEX "homepage_hero_banner_slides_image_idx" ON "homepage_hero_banner_slides" USING btree ("image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "homepage_hero_banner_slides" CASCADE;`)
}
