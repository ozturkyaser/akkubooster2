import { model } from "@medusajs/framework/utils"

/**
 * Brand — Hersteller eines Akkus (Bosch, Shimano, BionX, BMZ, ...)
 *
 * Ein Brand ist unabhängig vom Medusa Product-Katalog und wird per
 * Module Link mit Produkten und VehicleModels verknüpft.
 */
const Brand = model.define("brand", {
  id: model.id().primaryKey(),
  handle: model.text().unique(),
  name: model.text(),
  description: model.text().nullable(),
  logo_url: model.text().nullable(),
  country: model.text().nullable(),
  founded_year: model.number().nullable(),
  website: model.text().nullable(),
  is_featured: model.boolean().default(false),
  sort_order: model.number().default(0),
  // Smart-Match Regel: automatische Zuordnung von Produkten zur Marke
  // match_rule_type: "contains" | "exact" | "starts_with"
  // match_rule_field: "title" | "handle" | "description"
  // match_rule_value: optional — wenn null, wird brand.name verwendet
  match_rule_type: model.text().default("contains"),
  match_rule_field: model.text().default("title"),
  match_rule_value: model.text().nullable(),
  match_rule_enabled: model.boolean().default(true),
  // Brand-spezifische Service-Preise (Override)
  // Keys: diagnose, bms_standard, bms_high_voltage, zellentausch_from,
  //       balancing, ladebuchse, tiefentladung
  // Werte: Preis in Cent (z.B. 14000 = 140€)
  // Wenn null oder Key fehlt → Standardpreis aus Service-Produkt
  service_prices: model.json().nullable(),
  // Brand-spezifischer redaktioneller Inhalt fuer die Marken-Detailseite
  // im Storefront. Shape:
  //   {
  //     intro: string
  //     series: [{ name, capacity, note }]
  //     compatibleBrands: string[]
  //     problems: [{ icon, title, description, severity: "critical"|"warning"|"info" }]
  //     faqs: [{ question, answer }]
  //     testimonials: [{ name, location, rating (1-5), text }]
  //   }
  content: model.json().nullable(),
})

export default Brand
