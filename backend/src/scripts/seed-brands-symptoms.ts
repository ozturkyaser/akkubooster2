/**
 * AkkuBooster — Seed Brands & Symptoms
 *
 * Aufruf: pnpm exec medusa exec ./src/scripts/seed-brands-symptoms.ts
 *
 * Legt Startdatensätze an:
 *   - 25 häufige Hersteller aus dem aktuellen akkubooster.de Katalog + Top-Marken
 *   - 12 häufige Symptome (wie im Referenz-Design batterybros.de)
 */

import { ExecArgs } from "@medusajs/framework/types"
import { BRAND_MODULE } from "../modules/brand"
import { SYMPTOM_MODULE } from "../modules/symptom"
import BrandModuleService from "../modules/brand/service"
import SymptomModuleService from "../modules/symptom/service"

const BRANDS = [
  { handle: "bosch", name: "Bosch", country: "DE", is_featured: true, sort_order: 1 },
  { handle: "shimano", name: "Shimano", country: "JP", is_featured: true, sort_order: 2 },
  { handle: "yamaha", name: "Yamaha", country: "JP", is_featured: true, sort_order: 3 },
  { handle: "brose", name: "Brose", country: "DE", is_featured: true, sort_order: 4 },
  { handle: "panasonic", name: "Panasonic", country: "JP", is_featured: true, sort_order: 5 },
  { handle: "fazua", name: "Fazua", country: "DE", is_featured: true, sort_order: 6 },
  { handle: "bmz", name: "BMZ", country: "DE", is_featured: true, sort_order: 7 },
  { handle: "samsung-sdi", name: "Samsung SDI", country: "KR", is_featured: true, sort_order: 8 },
  { handle: "bionx", name: "BionX", country: "CA", is_featured: true, sort_order: 9 },
  { handle: "giant", name: "Giant", country: "TW", is_featured: true, sort_order: 10 },
  { handle: "specialized", name: "Specialized", country: "US", is_featured: false, sort_order: 11 },
  { handle: "bulls", name: "Bulls", country: "DE", is_featured: false, sort_order: 12 },
  { handle: "gazelle", name: "Gazelle", country: "NL", is_featured: false, sort_order: 13 },
  { handle: "derby-cycle", name: "Derby Cycle", country: "DE", is_featured: false, sort_order: 14 },
  { handle: "kalkhoff", name: "Kalkhoff", country: "DE", is_featured: false, sort_order: 15 },
  { handle: "victoria", name: "Victoria", country: "DE", is_featured: false, sort_order: 16 },
  { handle: "fischer", name: "FISCHER", country: "DE", is_featured: false, sort_order: 17 },
  { handle: "vanmoof", name: "VanMoof", country: "NL", is_featured: false, sort_order: 18 },
  { handle: "tranzx", name: "TranzX", country: "TW", is_featured: false, sort_order: 19 },
  { handle: "niu", name: "NIU", country: "CN", is_featured: true, sort_order: 20 },
  { handle: "super-soco", name: "Super Soco", country: "CN", is_featured: false, sort_order: 21 },
  { handle: "xiaomi", name: "Xiaomi", country: "CN", is_featured: true, sort_order: 22 },
  { handle: "segway", name: "Segway", country: "US", is_featured: false, sort_order: 23 },
  { handle: "qwic", name: "Qwic", country: "NL", is_featured: false, sort_order: 24 },
  { handle: "joycube", name: "Joycube", country: "CN", is_featured: false, sort_order: 25 },
]

const SYMPTOMS = [
  {
    handle: "akku-laedt-nicht",
    title: "Akku lädt nicht",
    short_description: "Ladegerät zeigt keine Reaktion, Akku nimmt keinen Strom auf",
    severity: "critical",
    icon: "battery-warning",
    probable_causes: ["BMS-Defekt", "Ladebuchse defekt", "Sicherung ausgelöst", "Zelldefekt"],
    recommended_action: "diagnosis",
    sort_order: 1,
  },
  {
    handle: "reichweite-stark-gesunken",
    title: "Reichweite stark gesunken",
    short_description: "Akku hält nur noch einen Bruchteil der ursprünglichen Kilometer",
    severity: "warning",
    icon: "trending-down",
    probable_causes: ["Zellalterung", "Einzelne defekte Zellen", "Kalibrierungsfehler"],
    recommended_action: "repair",
    sort_order: 2,
  },
  {
    handle: "akku-schaltet-sich-ab",
    title: "Akku schaltet sich während der Fahrt ab",
    short_description: "Plötzlicher Stromausfall, manchmal mit Fehlercode",
    severity: "critical",
    icon: "zap-off",
    probable_causes: ["BMS-Überlast-Schutz", "Lose Verbindung", "Temperaturprobleme"],
    recommended_action: "diagnosis",
    sort_order: 3,
  },
  {
    handle: "fehlercode-im-display",
    title: "Fehlercode im Display",
    short_description: "Controller/Display zeigt E-Code oder Fehlermeldung",
    severity: "warning",
    icon: "alert-triangle",
    probable_causes: ["Kommunikationsfehler", "Sensorfehler", "Firmware-Problem"],
    recommended_action: "diagnosis",
    sort_order: 4,
  },
  {
    handle: "akku-zeigt-falschen-ladestand",
    title: "Akku zeigt falschen Ladestand",
    short_description: "Anzeige springt oder ist nicht mehr kalibriert",
    severity: "info",
    icon: "battery-medium",
    probable_causes: ["Kalibrierung nötig", "BMS-Fehler", "Zellbalance verloren"],
    recommended_action: "repair",
    sort_order: 5,
  },
  {
    handle: "akku-ueberhitzt",
    title: "Akku wird sehr heiß",
    short_description: "Unnormal hohe Temperaturen beim Laden oder Fahren",
    severity: "critical",
    icon: "thermometer-sun",
    probable_causes: ["Kurzschluss", "Zelldefekt", "Belüftungsproblem"],
    recommended_action: "contact",
    sort_order: 6,
  },
  {
    handle: "akku-geschwollen",
    title: "Akku-Gehäuse aufgebläht",
    short_description: "Gehäuse verformt, Deckel steht ab",
    severity: "critical",
    icon: "alert-octagon",
    probable_causes: ["Zelldefekt (Tiefentladung)", "Feuchtigkeit eingedrungen"],
    recommended_action: "replace",
    sort_order: 7,
  },
  {
    handle: "akku-laesst-sich-nicht-einschalten",
    title: "Akku lässt sich nicht einschalten",
    short_description: "LED bleibt aus, keine Reaktion beim Power-Knopf",
    severity: "warning",
    icon: "power-off",
    probable_causes: ["Tiefentladung", "Schalter defekt", "BMS schläft"],
    recommended_action: "diagnosis",
    sort_order: 8,
  },
  {
    handle: "motor-hat-keine-kraft",
    title: "Motor hat keine Kraft",
    short_description: "Akku voll, aber E-Bike unterstützt kaum beim Fahren",
    severity: "warning",
    icon: "activity",
    probable_causes: ["Spannungseinbruch unter Last", "Hochohmige Zellen"],
    recommended_action: "diagnosis",
    sort_order: 9,
  },
  {
    handle: "akku-nach-winter-defekt",
    title: "Akku nach Winter-Lagerung defekt",
    short_description: "Nach Pause lädt er nicht mehr oder zeigt kaum Kapazität",
    severity: "warning",
    icon: "snowflake",
    probable_causes: ["Tiefentladung", "Kälteschäden", "Zellalterung"],
    recommended_action: "repair",
    sort_order: 10,
  },
  {
    handle: "komisches-knistern-geruch",
    title: "Ungewöhnliche Geräusche oder Geruch",
    short_description: "Knistern, Zischen oder verbrannter Geruch aus dem Akku",
    severity: "critical",
    icon: "flame",
    probable_causes: ["Kurzschluss", "Thermisches Problem — AKUTE GEFAHR"],
    recommended_action: "contact",
    sort_order: 11,
  },
  {
    handle: "laedt-nur-teilweise",
    title: "Akku lädt nur bis zu einem bestimmten Prozentwert",
    short_description: "Ladevorgang bricht bei z.B. 80% ab",
    severity: "warning",
    icon: "battery-charging",
    probable_causes: ["Zellbalance verloren", "BMS-Schutz aktiv"],
    recommended_action: "repair",
    sort_order: 12,
  },
]

export default async function seedBrandsSymptoms({ container }: ExecArgs) {
  const logger = container.resolve("logger") as any
  const brandService: BrandModuleService = container.resolve(BRAND_MODULE)
  const symptomService: SymptomModuleService = container.resolve(SYMPTOM_MODULE)

  logger.info("🏭 Seeding Brands...")

  const existingBrands = await brandService.listBrands({})
  const existingHandles = new Set(existingBrands.map((b) => b.handle))
  const toCreate = BRANDS.filter((b) => !existingHandles.has(b.handle))

  if (toCreate.length) {
    await brandService.createBrands(toCreate as any)
    logger.info(`✓ ${toCreate.length} Marken angelegt`)
  } else {
    logger.info("↳ Alle Marken existieren bereits")
  }

  logger.info("⚠️  Seeding Symptoms...")

  const existingSymptoms = await symptomService.listSymptoms({})
  const existingSymptomHandles = new Set(existingSymptoms.map((s) => s.handle))
  const symptomsToCreate = SYMPTOMS.filter(
    (s) => !existingSymptomHandles.has(s.handle)
  )

  if (symptomsToCreate.length) {
    await symptomService.createSymptoms(symptomsToCreate as any)
    logger.info(`✓ ${symptomsToCreate.length} Symptome angelegt`)
  } else {
    logger.info("↳ Alle Symptome existieren bereits")
  }

  const totalBrands = (await brandService.listBrands({})).length
  const totalSymptoms = (await symptomService.listSymptoms({})).length

  logger.info(`✅ Seed fertig — ${totalBrands} Marken, ${totalSymptoms} Symptome`)
}
