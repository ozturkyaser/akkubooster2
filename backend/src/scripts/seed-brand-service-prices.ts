/**
 * Seed Brand Service Prices
 * =========================
 *
 * Setzt beispielhafte service_prices-Overrides pro Marke.
 * Preise sind in Cent (1€ = 100).
 *
 * Aufruf:
 *   npx medusa exec ./src/scripts/seed-brand-service-prices.ts
 */

import { ExecArgs } from "@medusajs/framework/types"
import { BRAND_MODULE } from "../modules/brand"
import BrandModuleService from "../modules/brand/service"

type ServicePrices = {
  diagnose?: number
  bms_standard?: number
  bms_high_voltage?: number
  zellentausch_from?: number
  balancing?: number
  ladebuchse?: number
  tiefentladung?: number
}

// Keys sind Brand-Handles, Werte sind Cent-Preise
const OVERRIDES: Record<string, ServicePrices> = {
  // Bosch: Premium-System, aufwendig, leicht teurer
  bosch: {
    diagnose: 4900,
    bms_standard: 14000,
    bms_high_voltage: 18000,
    zellentausch_from: 34900,
    balancing: 15000,
  },
  // Shimano STEPS: Standardpreise
  shimano: {
    diagnose: 4900,
    bms_standard: 13000,
    zellentausch_from: 29900,
  },
  // Yamaha: robuste Systeme, Standard
  yamaha: {
    diagnose: 4900,
    bms_standard: 13000,
    zellentausch_from: 32900,
  },
  // Brose: aufwendig, Premium
  brose: {
    diagnose: 4900,
    bms_standard: 15000,
    zellentausch_from: 34900,
  },
  // Panasonic: aeltere Systeme, guenstiger
  panasonic: {
    diagnose: 4900,
    bms_standard: 12000,
    zellentausch_from: 24900,
  },
}

export default async function seedBrandServicePrices({
  container,
}: ExecArgs) {
  const logger = container.resolve("logger") as any
  const brandService: BrandModuleService = container.resolve(BRAND_MODULE)

  logger.info("🎯 Seed Brand Service-Preise...")

  let updated = 0
  let skipped = 0

  for (const [handle, prices] of Object.entries(OVERRIDES)) {
    const [brand] = await brandService.listBrands({ handle }, { take: 1 })
    if (!brand) {
      logger.warn(`  ⚠  Marke '${handle}' nicht gefunden — skip`)
      skipped++
      continue
    }
    await brandService.updateBrands({
      id: brand.id,
      service_prices: prices,
    } as any)
    const summary = Object.entries(prices)
      .map(([k, v]) => `${k}=${(v as number) / 100}€`)
      .join(", ")
    logger.info(`  ✓ ${brand.name}: ${summary}`)
    updated++
  }

  logger.info("")
  logger.info(`✅ ${updated} Marken aktualisiert, ${skipped} uebersprungen`)
}
