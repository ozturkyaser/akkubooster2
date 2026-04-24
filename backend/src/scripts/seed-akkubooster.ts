/**
 * AkkuBooster Seed Script
 * - Setzt Store auf EUR
 * - Erstellt Region "Europa DACH" (DE, AT, CH)
 * - Erstellt Stock Location "Werkstatt Berlin"
 * - Erstellt Tax Region für DE (19%), AT (20%), CH (7.7%)
 * - Erstellt Default Shipping Profile
 * - Verknüpft Default Sales Channel <-> Stock Location
 * - Verknüpft Publishable API Key <-> Default Sales Channel
 *
 * Aufruf: pnpm exec medusa exec ./src/scripts/seed-akkubooster.ts
 */

import { ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils";
import {
  createRegionsWorkflow,
  createStockLocationsWorkflow,
  createShippingProfilesWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows";

export default async function seedAkkuBooster({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const storeModuleService = container.resolve(Modules.STORE);
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL);
  const stockLocationModuleService = container.resolve(Modules.STOCK_LOCATION);
  const regionModuleService = container.resolve(Modules.REGION);
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT);

  logger.info("🔋 AkkuBooster Seed startet...");

  // 1. Store auf EUR setzen
  const [store] = await storeModuleService.listStores();
  if (!store) throw new Error("Kein Store gefunden");

  const [defaultSalesChannel] =
    await salesChannelModuleService.listSalesChannels({
      name: "Default Sales Channel",
    });

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        name: "AkkuBooster",
        supported_currencies: [
          { currency_code: "eur", is_default: true },
        ],
        default_sales_channel_id: defaultSalesChannel?.id,
      },
    },
  });
  logger.info("✓ Store auf EUR gesetzt");

  // 2. Region DACH (DE, AT, CH) — sofern nicht vorhanden
  const existingRegions = await regionModuleService.listRegions({
    name: "Europa DACH",
  });

  if (!existingRegions.length) {
    await createRegionsWorkflow(container).run({
      input: {
        regions: [
          {
            name: "Europa DACH",
            currency_code: "eur",
            countries: ["de", "at", "ch"],
            payment_providers: [
              "pp_stripe_stripe",       // Kreditkarte + SEPA Lastschrift
              "pp_paypal_paypal",        // PayPal
              "pp_system_default",       // Bankueberweisung / Bar bei Abholung
            ],
          },
        ],
      },
    });
    logger.info("✓ Region 'Europa DACH' (DE/AT/CH) erstellt");
  } else {
    logger.info("↳ Region 'Europa DACH' existiert bereits");
  }

  // 3. Stock Location Werkstatt Berlin
  const existingLocations = await stockLocationModuleService.listStockLocations(
    { name: "Werkstatt Berlin" }
  );

  let berlinLocation = existingLocations[0];
  if (!berlinLocation) {
    const { result } = await createStockLocationsWorkflow(container).run({
      input: {
        locations: [
          {
            name: "Werkstatt Berlin",
            address: {
              address_1: "Piesporterstr. 34",
              city: "Berlin",
              postal_code: "13088",
              country_code: "DE",
            },
          },
        ],
      },
    });
    berlinLocation = result[0];
    logger.info("✓ Stock Location 'Werkstatt Berlin' erstellt");

    // Link to default sales channel
    if (defaultSalesChannel) {
      await linkSalesChannelsToStockLocationWorkflow(container).run({
        input: {
          id: berlinLocation.id,
          add: [defaultSalesChannel.id],
        },
      });
      logger.info("✓ Sales Channel mit Stock Location verknüpft");
    }
  } else {
    logger.info("↳ Stock Location 'Werkstatt Berlin' existiert bereits");
  }

  // 4. Tax Regions
  const existingTaxRegions = await (
    container.resolve(Modules.TAX) as any
  ).listTaxRegions({ country_code: ["de", "at", "ch"] });

  const toCreate: any[] = [];
  if (!existingTaxRegions.find((t: any) => t.country_code === "de")) {
    toCreate.push({
      country_code: "de",
      default_tax_rate: { name: "USt. DE", rate: 19, code: "USTDE" },
    });
  }
  if (!existingTaxRegions.find((t: any) => t.country_code === "at")) {
    toCreate.push({
      country_code: "at",
      default_tax_rate: { name: "USt. AT", rate: 20, code: "USTAT" },
    });
  }
  if (!existingTaxRegions.find((t: any) => t.country_code === "ch")) {
    toCreate.push({
      country_code: "ch",
      default_tax_rate: { name: "MwSt. CH", rate: 7.7, code: "MWSTCH" },
    });
  }

  if (toCreate.length) {
    await createTaxRegionsWorkflow(container).run({
      input: toCreate,
    });
    logger.info(`✓ ${toCreate.length} Tax Region(en) erstellt`);
  } else {
    logger.info("↳ Tax Regions existieren bereits");
  }

  // 5. Default Shipping Profile
  const existingProfiles = await fulfillmentModuleService.listShippingProfiles({
    type: "default",
  });

  if (!existingProfiles.length) {
    await createShippingProfilesWorkflow(container).run({
      input: {
        data: [{ name: "Standard", type: "default" }],
      },
    });
    logger.info("✓ Default Shipping Profile erstellt");
  } else {
    logger.info("↳ Default Shipping Profile existiert bereits");
  }

  logger.info("✅ Seed abgeschlossen");
}
