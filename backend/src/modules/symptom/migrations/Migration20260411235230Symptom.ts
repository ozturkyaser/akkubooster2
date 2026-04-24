import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260411235230Symptom extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "symptom" drop constraint if exists "symptom_handle_unique";`);
    this.addSql(`create table if not exists "symptom" ("id" text not null, "handle" text not null, "title" text not null, "short_description" text null, "long_description" text null, "severity" text check ("severity" in ('info', 'warning', 'critical')) not null default 'warning', "icon" text null, "diagnostic_questions" jsonb null, "probable_causes" jsonb null, "recommended_action" text check ("recommended_action" in ('repair', 'replace', 'diagnosis', 'contact')) not null default 'diagnosis', "sort_order" integer not null default 0, "is_published" boolean not null default true, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "symptom_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_symptom_handle_unique" ON "symptom" ("handle") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_symptom_deleted_at" ON "symptom" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "symptom" cascade;`);
  }

}
