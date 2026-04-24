import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import {
  ContainerRegistrationKeys,
  QueryContext,
} from "@medusajs/framework/utils"
import { BRAND_MODULE } from "../../../../../modules/brand"
import BrandModuleService from "../../../../../modules/brand/service"

/**
 * GET /store/brands/:handle/services
 *
 * Liefert die Standard-Services mit brand-spezifischen Preis-Overrides aus
 * `brand.service_prices`. Wenn kein Override existiert, wird der Preis aus
 * der Service-Produkt-Variante verwendet (Fallback).
 *
 * Antwort:
 *   {
 *     services: [
 *       { key, title, handle, price, default_price, overridden, variant_id },
 *       ...
 *     ],
 *     brand: { handle, name }
 *   }
 */

type ServiceKey =
  | "diagnose"
  | "bms_standard"
  | "bms_high_voltage"
  | "zellentausch_from"
  | "balancing"
  | "ladebuchse"
  | "tiefentladung"

type ServiceDef = {
  key: ServiceKey
  title: string
  // Wenn null → rein Override-basiert (kein Standard-Service-Produkt)
  product_handle: string | null
  // Bei BMS gibt es zwei Varianten (≤60V / >60V) — wir mappen per Index.
  variant_index?: number
}

const SERVICE_DEFS: ServiceDef[] = [
  { key: "diagnose", title: "Akku-Diagnose", product_handle: "service-diagnose" },
  {
    key: "bms_standard",
    title: "BMS-Austausch (≤60V)",
    product_handle: "service-bms-austausch",
    variant_index: 0,
  },
  {
    key: "bms_high_voltage",
    title: "BMS-Austausch (>60V)",
    product_handle: "service-bms-austausch",
    variant_index: 1,
  },
  {
    key: "zellentausch_from",
    title: "Zellentausch (ab)",
    // Kein Standard-Produkt — Zellentausch ist produkt-spezifisch.
    // Brand-Override definiert den Startpreis fuer Kommunikation.
    product_handle: null,
  },
  {
    key: "ladebuchse",
    title: "Ladebuchse Austausch",
    product_handle: "service-ladebuchse",
  },
  {
    key: "tiefentladung",
    title: "Tiefentladung beheben",
    product_handle: "service-tiefentladung",
  },
  {
    key: "balancing",
    title: "Zell-Ausbalancierung",
    product_handle: "service-ausbalancierung",
  },
]

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const brandService: BrandModuleService = req.scope.resolve(BRAND_MODULE)
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { handle } = req.params

  const [brand] = await brandService.listBrands({ handle }, { take: 1 })
  if (!brand) {
    res.status(404).json({
      type: "not_found",
      message: `Marke '${handle}' nicht gefunden`,
    })
    return
  }

  const overrides = ((brand as any).service_prices || {}) as Partial<
    Record<ServiceKey, number>
  >

  // Alle Service-Produkte in einem Zug laden (mit Pricing-Context)
  const handles = Array.from(
    new Set(
      SERVICE_DEFS.map((d) => d.product_handle).filter(
        (h): h is string => !!h
      )
    )
  )
  const productByHandle = new Map<string, any>()
  try {
    const { data } = await query.graph({
      entity: "product",
      filters: { handle: handles },
      fields: [
        "id",
        "handle",
        "title",
        "variants.id",
        "variants.title",
        "variants.calculated_price.*",
      ],
      context: {
        variants: {
          calculated_price: QueryContext({ currency_code: "eur" }),
        },
      } as any,
    })
    for (const p of data as any[]) productByHandle.set(p.handle, p)
  } catch (e: any) {
    console.error("Service-Produkte Query-Fehler:", e.message)
  }

  const services = SERVICE_DEFS.map((def) => {
    const product = def.product_handle
      ? productByHandle.get(def.product_handle)
      : null
    const variant = product?.variants?.[def.variant_index ?? 0]
    const defaultPrice =
      variant?.calculated_price?.calculated_amount ?? null
    const override = overrides[def.key]
    const price = typeof override === "number" ? override : defaultPrice

    return {
      key: def.key,
      title: def.title,
      product_handle: def.product_handle,
      variant_id: variant?.id ?? null,
      price,
      default_price: defaultPrice,
      overridden: typeof override === "number",
    }
  })

  res.json({
    brand: { handle: brand.handle, name: brand.name },
    services,
  })
}
