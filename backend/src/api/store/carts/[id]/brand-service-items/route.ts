import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import {
  ContainerRegistrationKeys,
  QueryContext,
} from "@medusajs/framework/utils"
import { addToCartWorkflow } from "@medusajs/medusa/core-flows"
import { BRAND_MODULE } from "../../../../../modules/brand"
import BrandModuleService from "../../../../../modules/brand/service"

/**
 * POST /store/carts/:id/brand-service-items
 *
 * Fuegt dem Cart einen Service als Line-Item mit brand-spezifischem
 * `unit_price` Override hinzu. Der Preis wird serverseitig aus
 * `brand.service_prices[service_key]` gelesen — der Client darf hier
 * keinen Preis angeben.
 *
 * Body:
 *   {
 *     brand_handle: string      // z.B. "bosch"
 *     service_key:  ServiceKey  // z.B. "bms_standard"
 *     quantity?:    number
 *   }
 *
 * Rueckgabe: { cart }
 */

type ServiceKey =
  | "diagnose"
  | "bms_standard"
  | "bms_high_voltage"
  | "zellentausch_from"
  | "balancing"
  | "ladebuchse"
  | "tiefentladung"

type ServiceResolution = {
  product_handle: string | null
  variant_index: number
}

const SERVICE_DEFS: Record<ServiceKey, ServiceResolution> = {
  diagnose: { product_handle: "service-diagnose", variant_index: 0 },
  bms_standard: { product_handle: "service-bms-austausch", variant_index: 0 },
  bms_high_voltage: {
    product_handle: "service-bms-austausch",
    variant_index: 1,
  },
  zellentausch_from: { product_handle: null, variant_index: 0 },
  balancing: { product_handle: "service-ausbalancierung", variant_index: 0 },
  ladebuchse: { product_handle: "service-ladebuchse", variant_index: 0 },
  tiefentladung: { product_handle: "service-tiefentladung", variant_index: 0 },
}

const VALID_KEYS = new Set<ServiceKey>(
  Object.keys(SERVICE_DEFS) as ServiceKey[]
)

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id: cartId } = req.params
  const body = (req.body ?? {}) as {
    brand_handle?: string
    service_key?: ServiceKey
    quantity?: number
  }

  const { brand_handle, service_key } = body
  const quantity = body.quantity && body.quantity > 0 ? body.quantity : 1

  if (!brand_handle || !service_key) {
    res.status(400).json({
      type: "invalid_data",
      message: "brand_handle und service_key sind erforderlich",
    })
    return
  }

  if (!VALID_KEYS.has(service_key)) {
    res.status(400).json({
      type: "invalid_data",
      message: `Unbekannter service_key '${service_key}'`,
    })
    return
  }

  const def = SERVICE_DEFS[service_key]
  if (!def.product_handle) {
    res.status(400).json({
      type: "invalid_data",
      message: `Service '${service_key}' ist nicht als Warenkorb-Artikel verfuegbar`,
    })
    return
  }

  const brandService: BrandModuleService = req.scope.resolve(BRAND_MODULE)
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  // 1) Brand + Override-Preis laden
  const [brand] = await brandService.listBrands(
    { handle: brand_handle },
    { take: 1 }
  )
  if (!brand) {
    res.status(404).json({
      type: "not_found",
      message: `Marke '${brand_handle}' nicht gefunden`,
    })
    return
  }
  const overrides = ((brand as any).service_prices || {}) as Partial<
    Record<ServiceKey, number>
  >
  const overridePrice = overrides[service_key]

  // 2) Service-Produkt + Variante aufloesen (+ Fallback-Preis)
  const { data: products } = await query.graph({
    entity: "product",
    filters: { handle: [def.product_handle] },
    fields: [
      "id",
      "handle",
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

  const product = (products as any[])[0]
  const variant = product?.variants?.[def.variant_index]
  if (!variant) {
    res.status(404).json({
      type: "not_found",
      message: `Service-Produkt '${def.product_handle}' nicht gefunden`,
    })
    return
  }

  // 3) Effektiven Preis bestimmen: Override hat Vorrang.
  //    Wenn kein Override gesetzt ist, laeuft der normale Pricing-Path
  //    (unit_price undefined → Workflow nutzt calculated_price).
  const unitPrice =
    typeof overridePrice === "number" ? overridePrice : undefined

  try {
    await addToCartWorkflow(req.scope).run({
      input: {
        cart_id: cartId,
        items: [
          {
            variant_id: variant.id,
            quantity,
            ...(unitPrice !== undefined ? { unit_price: unitPrice } : {}),
            metadata: {
              brand_handle: brand.handle,
              brand_name: (brand as any).name,
              service_key,
              brand_override: unitPrice !== undefined,
            },
          },
        ],
      },
    })
  } catch (e: any) {
    res.status(500).json({
      type: "workflow_error",
      message: e.message || "Hinzufuegen fehlgeschlagen",
    })
    return
  }

  // 4) Cart zurueckgeben
  const { data: carts } = await query.graph({
    entity: "cart",
    filters: { id: cartId },
    fields: [
      "id",
      "currency_code",
      "items.*",
      "items.metadata",
      "total",
      "subtotal",
    ],
  })

  res.json({
    cart: (carts as any[])[0] ?? null,
    applied_override: unitPrice !== undefined,
    unit_price: unitPrice ?? variant?.calculated_price?.calculated_amount ?? null,
  })
}
