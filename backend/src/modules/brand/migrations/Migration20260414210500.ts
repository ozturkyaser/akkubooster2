import { Migration } from "@mikro-orm/migrations"

export class Migration20260414210500 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      `alter table "brand" add column if not exists "match_rule_type" text not null default 'contains';`
    )
    this.addSql(
      `alter table "brand" add column if not exists "match_rule_field" text not null default 'title';`
    )
    this.addSql(
      `alter table "brand" add column if not exists "match_rule_value" text null;`
    )
    this.addSql(
      `alter table "brand" add column if not exists "match_rule_enabled" boolean not null default true;`
    )
  }

  async down(): Promise<void> {
    this.addSql(`alter table "brand" drop column if exists "match_rule_type";`)
    this.addSql(`alter table "brand" drop column if exists "match_rule_field";`)
    this.addSql(`alter table "brand" drop column if exists "match_rule_value";`)
    this.addSql(`alter table "brand" drop column if exists "match_rule_enabled";`)
  }
}
