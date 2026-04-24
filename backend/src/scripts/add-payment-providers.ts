/**
 * Fuegt Payment-Provider (Stripe, PayPal) zur bestehenden Region hinzu.
 *
 * Aufruf: pnpm exec medusa exec ./src/scripts/add-payment-providers.ts
 */

import { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"

export default async function addPaymentProviders({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const regionModuleService = container.resolve(Modules.REGION)
  const paymentModuleService = container.resolve(Modules.PAYMENT)
  const remoteLink = container.resolve(ContainerRegistrationKeys.REMOTE_LINK)

  logger.info("💳 Payment-Provider Setup startet...")

  // 1. Verfuegbare Payment Provider auflisten
  try {
    const providers = await paymentModuleService.listPaymentProviders()
    logger.info(`Verfuegbare Provider: ${providers.map((p: any) => p.id).join(", ")}`)
  } catch (e: any) {
    logger.warn(`Konnte Provider nicht listen: ${e.message}`)
  }

  // 2. Region finden
  const regions = await regionModuleService.listRegions({ name: "Europa DACH" })
  if (!regions.length) {
    logger.error("❌ Region 'Europa DACH' nicht gefunden. Bitte zuerst seed:akkubooster ausfuehren.")
    return
  }
  const region = regions[0]
  logger.info(`Region gefunden: ${region.name} (${region.id})`)

  // 3. Payment Provider mit Region verknuepfen
  const providerIds = ["pp_stripe_stripe", "pp_paypal_paypal", "pp_system_default"]

  for (const providerId of providerIds) {
    try {
      await remoteLink.create({
        [Modules.REGION]: { region_id: region.id },
        [Modules.PAYMENT]: { payment_provider_id: providerId },
      })
      logger.info(`✅ ${providerId} mit Region verknuepft`)
    } catch (e: any) {
      if (e.message?.includes("already exists") || e.message?.includes("duplicate")) {
        logger.info(`↳ ${providerId} bereits verknuepft`)
      } else {
        logger.warn(`⚠ ${providerId}: ${e.message}`)
      }
    }
  }

  logger.info("💳 Payment-Provider Setup abgeschlossen!")
  logger.info("")
  logger.info("Naechste Schritte:")
  logger.info("1. Trage deine Stripe Test-Keys in backend/.env ein")
  logger.info("2. Trage deine PayPal Sandbox-Keys in backend/.env ein")
  logger.info("3. Starte das Backend neu: pnpm backend:dev")
  logger.info("4. Teste den Checkout im Storefront")
}
