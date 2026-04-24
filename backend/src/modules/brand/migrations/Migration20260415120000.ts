import { Migration } from "@mikro-orm/migrations"

export class Migration20260415120000 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      `alter table "brand" add column if not exists "content" jsonb null;`
    )
  }

  async down(): Promise<void> {
    this.addSql(`alter table "brand" drop column if exists "content";`)
  }
}
