import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BRAND_MODULE } from "../../../../modules/brand"
import BrandModuleService from "../../../../modules/brand/service"

/**
 * GET  /admin/brands/:id — Brand mit allen Feldern (inkl. Rule)
 * PATCH /admin/brands/:id — Update Brand (inkl. match_rule_*)
 */

const ALLOWED_RULE_TYPES = ["contains", "exact", "starts_with"] as const
const ALLOWED_RULE_FIELDS = ["title", "handle", "description"] as const
const ALLOWED_SERVICE_KEYS = [
  "diagnose",
  "bms_standard",
  "bms_high_voltage",
  "zellentausch_from",
  "balancing",
  "ladebuchse",
  "tiefentladung",
] as const

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const brandService: BrandModuleService = req.scope.resolve(BRAND_MODULE)
  const { id } = req.params

  const [brand] = await brandService.listBrands({ id }, { take: 1 })
  if (!brand) {
    res.status(404).json({ type: "not_found", message: "Brand not found" })
    return
  }
  res.json({ brand })
}

export async function PATCH(req: MedusaRequest, res: MedusaResponse) {
  const brandService: BrandModuleService = req.scope.resolve(BRAND_MODULE)
  const { id } = req.params
  const body = (req.body || {}) as Record<string, any>

  const updates: Record<string, any> = {}

  // Basisfelder
  for (const key of [
    "handle",
    "name",
    "description",
    "logo_url",
    "country",
    "founded_year",
    "website",
    "is_featured",
    "sort_order",
  ]) {
    if (key in body) updates[key] = body[key]
  }

  // Regel-Felder validieren
  if ("match_rule_type" in body) {
    if (!ALLOWED_RULE_TYPES.includes(body.match_rule_type)) {
      res.status(400).json({
        type: "invalid_data",
        message: `match_rule_type muss einer von ${ALLOWED_RULE_TYPES.join(", ")} sein`,
      })
      return
    }
    updates.match_rule_type = body.match_rule_type
  }
  if ("match_rule_field" in body) {
    if (!ALLOWED_RULE_FIELDS.includes(body.match_rule_field)) {
      res.status(400).json({
        type: "invalid_data",
        message: `match_rule_field muss einer von ${ALLOWED_RULE_FIELDS.join(", ")} sein`,
      })
      return
    }
    updates.match_rule_field = body.match_rule_field
  }
  if ("match_rule_value" in body) {
    updates.match_rule_value = body.match_rule_value || null
  }
  if ("match_rule_enabled" in body) {
    updates.match_rule_enabled = Boolean(body.match_rule_enabled)
  }

  // service_prices: Record<ServiceKey, number (cents)> | null
  if ("service_prices" in body) {
    const sp = body.service_prices
    if (sp === null) {
      updates.service_prices = null
    } else if (typeof sp === "object" && !Array.isArray(sp)) {
      const cleaned: Record<string, number> = {}
      for (const [k, v] of Object.entries(sp)) {
        if (!ALLOWED_SERVICE_KEYS.includes(k as any)) {
          res.status(400).json({
            type: "invalid_data",
            message: `service_prices: Key '${k}' nicht erlaubt. Erlaubt: ${ALLOWED_SERVICE_KEYS.join(", ")}`,
          })
          return
        }
        if (v === null || v === undefined) continue
        if (typeof v !== "number" || !Number.isFinite(v) || v < 0) {
          res.status(400).json({
            type: "invalid_data",
            message: `service_prices.${k} muss eine positive Zahl (Cent) sein`,
          })
          return
        }
        cleaned[k] = Math.round(v)
      }
      updates.service_prices = cleaned
    } else {
      res.status(400).json({
        type: "invalid_data",
        message: "service_prices muss ein Objekt oder null sein",
      })
      return
    }
  }

  // content: freier JSON-Block fuer die Marken-Detailseite
  if ("content" in body) {
    const c = body.content
    if (c === null) {
      updates.content = null
    } else if (typeof c === "object" && !Array.isArray(c)) {
      updates.content = c
    } else {
      res.status(400).json({
        type: "invalid_data",
        message: "content muss ein Objekt oder null sein",
      })
      return
    }
  }

  const brand = await brandService.updateBrands({ id, ...updates })
  res.json({ brand })
}
