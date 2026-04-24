import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260411235229Vehicle extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "vehicle_model" drop constraint if exists "vehicle_model_handle_unique";`);
    this.addSql(`create table if not exists "vehicle_model" ("id" text not null, "handle" text not null, "name" text not null, "type" text check ("type" in ('ebike', 'escooter', 'ecargo', 'emoped', 'other')) not null default 'ebike', "year_from" integer null, "year_to" integer null, "voltage" integer null, "capacity_wh" integer null, "capacity_ah" integer null, "image_url" text null, "description" text null, "is_repairable" boolean not null default true, "is_replaceable" boolean not null default true, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "vehicle_model_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_vehicle_model_handle_unique" ON "vehicle_model" ("handle") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_vehicle_model_deleted_at" ON "vehicle_model" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "vehicle_model" cascade;`);
  }

}
