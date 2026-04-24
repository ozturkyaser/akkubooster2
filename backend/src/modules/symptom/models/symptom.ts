import { model } from "@medusajs/framework/utils"

/**
 * Symptom — ein häufiges Akku-Problem, das Kunden beschreiben
 * z.B. "Akku lädt nicht", "Reichweite stark gesunken", "Fehlercode E-5"
 *
 * Wird im Symptom-Navigator auf der Storefront angezeigt und per Link
 * mit empfohlenen Produkten/Services verknüpft.
 */
const Symptom = model.define("symptom", {
  id: model.id().primaryKey(),
  handle: model.text().unique(),
  title: model.text(),
  short_description: model.text().nullable(),
  long_description: model.text().nullable(),
  severity: model.enum(["info", "warning", "critical"]).default("warning"),
  icon: model.text().nullable(),                // Lucide icon name z.B. "battery-low"
  diagnostic_questions: model.json().nullable(), // { q1: "...", q2: "..." }
  probable_causes: model.json().nullable(),      // ["Zelldefekt", "BMS-Fehler"]
  recommended_action: model.enum([
    "repair",
    "replace",
    "diagnosis",
    "contact",
  ]).default("diagnosis"),
  sort_order: model.number().default(0),
  is_published: model.boolean().default(true),
})

export default Symptom
