import { Migration } from "@mikro-orm/migrations"

export class Migration20260414220000 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      `alter table "brand" add column if not exists "service_prices" jsonb null;`
    )
  }

  async down(): Promise<void> {
    this.addSql(`alter table "brand" drop column if exists "service_prices";`)
  }
}
