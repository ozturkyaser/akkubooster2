/**
 * Seed-Script: Erstellt Service-Produkte (Diagnose, BMS, Ladebuchse, Tiefentladung, Ausbalancierung)
 * in Medusa, damit sie im Warenkorb bestellt und bezahlt werden können.
 *
 * Ausführen:  npx medusa exec src/scripts/seed-service-products.ts
 */
import { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils"
import { createProductsWorkflow } from "@medusajs/medusa/core-flows"
import { ISalesChannelModuleService } from "@medusajs/framework/types"

const SERVICES = [
  {
    handle: "service-diagnose",
    title: "Akku-Diagnose",
    description:
      "Professionelle Diagnose Ihres E-Bike Akkus. Umfassende Spannungsprüfung, BMS-Test, Lade-/Entladetest mit Messprotokoll. Schriftlicher Befund mit Fotos und Reparatur-Empfehlung. Wird bei Reparaturauftrag vollständig angerechnet.",
    variants: [
      { title: "Standard-Diagnose", sku: "SVC-DIAGNOSE", price: 4900 },
    ],
  },
  {
    handle: "service-bms-austausch",
    title: "BMS-Austausch",
    description:
      "Austausch des Batterie-Management-Systems (BMS). Behebt Fehlermeldungen, Abschaltungen und Kommunikationsprobleme. Inkl. BMS-Diagnose, Austausch, Zell-Balancing und Funktionstest.",
    variants: [
      { title: "BMS-Austausch ≤60V", sku: "SVC-BMS-60V", price: 12000 },
      { title: "BMS-Austausch >60V", sku: "SVC-BMS-60V-PLUS", price: 15000 },
    ],
  },
  {
    handle: "service-ladebuchse",
    title: "Ladebuchse / Anschlussbuchse Austausch",
    description:
      "Austausch defekter Lade- oder Anschlussbuchsen. Löst Probleme beim Laden oder der Verbindung zum E-Bike. Inkl. Buchsen-Diagnose, Lötarbeiten, Abdichtung und Funktionstest.",
    variants: [
      { title: "Buchsen-Austausch", sku: "SVC-BUCHSE", price: 8900 },
    ],
  },
  {
    handle: "service-tiefentladung",
    title: "Tiefentladung beheben",
    description:
      "Wiederbelebung tiefentladener Akkuzellen. Schonende Wiederaufladung, Zell-Balancing und Kapazitätstest.",
    variants: [
      { title: "Tiefentladung beheben", sku: "SVC-TIEFENTLADUNG", price: 15000 },
    ],
  },
  {
    handle: "service-ausbalancierung",
    title: "Zell-Ausbalancierung",
    description:
      "Ausgleich der Zellspannungen für gleichmäßige Leistung. Behebt ungleichmäßige Entladung und verlängert die Lebensdauer.",
    variants: [
      { title: "Zell-Ausbalancierung", sku: "SVC-BALANCE", price: 15000 },
    ],
  },
]

export default async function seedServiceProducts({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const salesChannelModuleService: ISalesChannelModuleService = container.resolve(Modules.SALES_CHANNEL)

  logger.info("🔧 Erstelle Service-Produkte in Medusa...")

  // 1. Sales Channel
  const salesChannels = await salesChannelModuleService.listSalesChannels({})
  if (!salesChannels.length) {
    logger.error("Kein Sales Channel gefunden.")
    return
  }
  const salesChannelId = salesChannels[0].id
  logger.info(`  Sales Channel: ${salesChannels[0].name} (${salesChannelId})`)

  // 2. Check existing products
  const { data: existingProducts } = await query.graph({
    entity: "product",
    fields: ["handle"],
  })
  const existingHandles = new Set(existingProducts.map((p: any) => p.handle))

  let created = 0
  let skipped = 0

  for (const svc of SERVICES) {
    if (existingHandles.has(svc.handle)) {
      logger.info(`  ⏭ ${svc.title} existiert bereits (${svc.handle})`)
      skipped++
      continue
    }

    const optionValues = svc.variants.map((v) => v.title)
    const variants = svc.variants.map((v) => ({
      title: v.title,
      sku: v.sku,
      manage_inventory: false,
      prices: [{ amount: v.price, currency_code: "eur" }],
      options: { Typ: v.title },
    }))

    try {
      await createProductsWorkflow(container).run({
        input: {
          products: [
            {
              title: svc.title,
              handle: svc.handle,
              description: svc.description,
              status: ProductStatus.PUBLISHED,
              is_giftcard: false,
              weight: 0,
              options: [{ title: "Typ", values: optionValues }],
              variants,
              sales_channels: [{ id: salesChannelId }],
              metadata: {
                is_service: "true",
                service_type: svc.handle.replace("service-", ""),
              },
            },
          ],
        },
      })

      logger.info(`  ✅ ${svc.title} erstellt (${svc.variants.length} Variante(n))`)
      created++
    } catch (err: any) {
      logger.error(`  ❌ Fehler bei ${svc.title}: ${err.message}`)
    }
  }

  logger.info(`\n✅ Fertig: ${created} erstellt, ${skipped} übersprungen.`)
}
