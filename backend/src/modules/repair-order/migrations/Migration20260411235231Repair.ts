import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260411235231Repair extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "diagnosis" drop constraint if exists "diagnosis_repair_order_id_unique";`);
    this.addSql(`alter table if exists "repair_order" drop constraint if exists "repair_order_reference_unique";`);
    this.addSql(`create table if not exists "repair_order" ("id" text not null, "reference" text not null, "status" text check ("status" in ('received', 'diagnosing', 'quoted', 'approved', 'declined', 'in_repair', 'testing', 'shipped', 'completed', 'cancelled')) not null default 'received', "customer_email" text not null, "customer_name" text null, "customer_phone" text null, "brand_name" text null, "vehicle_model_name" text null, "reported_symptoms" jsonb null, "customer_notes" text null, "intake_photos" jsonb null, "quote_amount" numeric null, "quote_currency" text not null default 'eur', "quote_valid_until" timestamptz null, "final_amount" numeric null, "warranty_months" integer not null default 12, "warranty_until" timestamptz null, "tracking_number" text null, "tracking_url" text null, "internal_notes" text null, "metadata" jsonb null, "raw_quote_amount" jsonb null, "raw_final_amount" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "repair_order_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_repair_order_reference_unique" ON "repair_order" ("reference") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_repair_order_deleted_at" ON "repair_order" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "diagnosis" ("id" text not null, "photos" jsonb null, "ai_brand_detected" text null, "ai_model_detected" text null, "ai_damage_description" text null, "ai_confidence" integer null, "ai_raw_response" jsonb null, "ai_recommended_services" jsonb null, "technician_notes" text null, "technician_verdict" text check ("technician_verdict" in ('pending', 'repairable', 'not_repairable', 'needs_more_info')) not null default 'pending', "measured_voltage" integer null, "measured_capacity_wh" integer null, "cell_count_defective" integer null, "repair_order_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "diagnosis_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_diagnosis_repair_order_id_unique" ON "diagnosis" ("repair_order_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_diagnosis_deleted_at" ON "diagnosis" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "repair_timeline_event" ("id" text not null, "type" text check ("type" in ('status_change', 'note', 'photo_added', 'quote_sent', 'quote_approved', 'quote_declined', 'shipping_update')) not null default 'status_change', "title" text not null, "description" text null, "is_customer_visible" boolean not null default true, "actor" text check ("actor" in ('customer', 'technician', 'system', 'ai')) not null default 'system', "metadata" jsonb null, "repair_order_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "repair_timeline_event_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_repair_timeline_event_repair_order_id" ON "repair_timeline_event" ("repair_order_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_repair_timeline_event_deleted_at" ON "repair_timeline_event" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "diagnosis" add constraint "diagnosis_repair_order_id_foreign" foreign key ("repair_order_id") references "repair_order" ("id") on update cascade;`);

    this.addSql(`alter table if exists "repair_timeline_event" add constraint "repair_timeline_event_repair_order_id_foreign" foreign key ("repair_order_id") references "repair_order" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "diagnosis" drop constraint if exists "diagnosis_repair_order_id_foreign";`);

    this.addSql(`alter table if exists "repair_timeline_event" drop constraint if exists "repair_timeline_event_repair_order_id_foreign";`);

    this.addSql(`drop table if exists "repair_order" cascade;`);

    this.addSql(`drop table if exists "diagnosis" cascade;`);

    this.addSql(`drop table if exists "repair_timeline_event" cascade;`);
  }

}
