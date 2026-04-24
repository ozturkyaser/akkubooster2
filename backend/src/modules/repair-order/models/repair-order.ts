import { model } from "@medusajs/framework/utils"

/**
 * RepairOrder — ein Reparatur-Auftrag für einen Akku
 *
 * Lebenszyklus:
 *   received → diagnosing → quoted → approved → in_repair → testing → shipped → completed
 *                              ↓
 *                          declined (wenn Kunde Angebot ablehnt)
 *
 * Wird per Module Link mit Medusa Order/Customer verknüpft (siehe src/links/).
 */
export const RepairOrder = model.define("repair_order", {
  id: model.id().primaryKey(),
  reference: model.text().unique(),              // z.B. "AB-2026-00042"
  status: model
    .enum([
      "received",       // Akku eingegangen
      "diagnosing",     // Diagnose läuft
      "quoted",         // Angebot erstellt
      "approved",       // Kunde hat Angebot angenommen
      "declined",       // Kunde hat abgelehnt → Rückversand
      "in_repair",      // Reparatur läuft
      "testing",        // Qualitätskontrolle
      "shipped",        // Rückversand an Kunde
      "completed",      // Abgeschlossen
      "cancelled",      // Storniert
    ])
    .default("received"),
  customer_email: model.text(),
  customer_name: model.text().nullable(),
  customer_phone: model.text().nullable(),
  brand_name: model.text().nullable(),           // Redundant gespeichert (falls Brand gelöscht)
  vehicle_model_name: model.text().nullable(),
  reported_symptoms: model.json().nullable(),    // [{ handle, title }, ...]
  customer_notes: model.text().nullable(),
  intake_photos: model.json().nullable(),        // [url1, url2, ...]
  quote_amount: model.bigNumber().nullable(),    // in Cent
  quote_currency: model.text().default("eur"),
  quote_valid_until: model.dateTime().nullable(),
  final_amount: model.bigNumber().nullable(),
  warranty_months: model.number().default(12),
  warranty_until: model.dateTime().nullable(),
  tracking_number: model.text().nullable(),
  tracking_url: model.text().nullable(),
  internal_notes: model.text().nullable(),
  metadata: model.json().nullable(),
  diagnosis: model.hasOne(() => Diagnosis, { mappedBy: "repair_order" }),
  timeline: model.hasMany(() => RepairTimelineEvent, { mappedBy: "repair_order" }),
})

/**
 * Diagnosis — KI- und/oder Techniker-Diagnose eines Akkus
 */
export const Diagnosis = model.define("diagnosis", {
  id: model.id().primaryKey(),
  photos: model.json().nullable(),               // [url1, url2, ...]
  ai_brand_detected: model.text().nullable(),
  ai_model_detected: model.text().nullable(),
  ai_damage_description: model.text().nullable(),
  ai_confidence: model.number().nullable(),       // 0..1
  ai_raw_response: model.json().nullable(),
  ai_recommended_services: model.json().nullable(), // ["cell_replacement", "balancing"]
  technician_notes: model.text().nullable(),
  technician_verdict: model.enum([
    "pending",
    "repairable",
    "not_repairable",
    "needs_more_info",
  ]).default("pending"),
  measured_voltage: model.number().nullable(),
  measured_capacity_wh: model.number().nullable(),
  cell_count_defective: model.number().nullable(),
  repair_order: model.belongsTo(() => RepairOrder, { mappedBy: "diagnosis" }),
})

/**
 * RepairTimelineEvent — ein Status-Wechsel oder Hinweis im Reparatur-Verlauf
 * Wird auf der /account/reparatur/:id Seite als Timeline angezeigt
 */
export const RepairTimelineEvent = model.define("repair_timeline_event", {
  id: model.id().primaryKey(),
  type: model.enum([
    "status_change",
    "note",
    "photo_added",
    "quote_sent",
    "quote_approved",
    "quote_declined",
    "shipping_update",
  ]).default("status_change"),
  title: model.text(),
  description: model.text().nullable(),
  is_customer_visible: model.boolean().default(true),
  actor: model.enum(["customer", "technician", "system", "ai"]).default("system"),
  metadata: model.json().nullable(),
  repair_order: model.belongsTo(() => RepairOrder, { mappedBy: "timeline" }),
})
