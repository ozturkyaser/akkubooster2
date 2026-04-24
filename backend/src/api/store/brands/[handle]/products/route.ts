import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import {
  ContainerRegistrationKeys,
} from "@medusajs/framework/utils"
import { BRAND_MODULE } from "../../../../../modules/brand"
import BrandModuleService from "../../../../../modules/brand/service"

/**
 * GET /store/brands/:handle/products
 *
 * Liefert Produkte einer Marke zurueck. Kombiniert zwei Quellen:
 *   1. Explizit verlinkte Produkte (via Module-Link)
 *   2. Produkte, die der Smart-Match-Regel der Marke entsprechen
 *      (match_rule_type: contains | exact | starts_with
 *       match_rule_field: title | handle | description
 *       match_rule_value: optional — fallback = brand.name)
 *
 * Die beiden Listen werden zusammengefuehrt und nach id dedupliziert.
 *
 * Query:
 *   - limit=12
 *   - offset=0
 */

type RuleType = "contains" | "exact" | "starts_with"
type RuleField = "title" | "handle" | "description"

function matchesRule(
  product: any,
  type: RuleType,
  field: RuleField,
  value: string
): boolean {
  const raw = (product?.[field] ?? "") as string
  if (!raw) return false
  const haystack = raw.toLowerCase()
  const needle = value.toLowerCase().trim()
  if (!needle) return false

  switch (type) {
    case "exact":
      return haystack === needle
    case "starts_with":
      return haystack.startsWith(needle)
    case "contains":
    default:
      return haystack.includes(needle)
  }
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const brandService: BrandModuleService = req.scope.resolve(BRAND_MODULE)
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { handle } = req.params
  const { limit: limitStr, offset: offsetStr } = req.query as Record<
    string,
    string
  >

  const take = limitStr ? parseInt(limitStr) : 12
  const skip = offsetStr ? parseInt(offsetStr) : 0

  // 1. Brand finden (inkl. Rule-Felder)
  const [brand] = await brandService.listBrands({ handle }, { take: 1 })

  if (!brand) {
    res.status(404).json({
      type: "not_found",
      message: `Marke '${handle}' nicht gefunden`,
    })
    return
  }

  const ruleType = ((brand as any).match_rule_type || "contains") as RuleType
  const ruleField = ((brand as any).match_rule_field || "title") as RuleField
  const ruleValue =
    ((brand as any).match_rule_value as string | null) ||
    brand.name ||
    handle
  const ruleEnabled = (brand as any).match_rule_enabled !== false

  // 2. Explizit verlinkte Produkte via Medusa Query
  const linkedProducts: any[] = []
  try {
    const { data } = await query.graph({
      entity: "brand",
      filters: { id: brand.id },
      fields: [
        "id",
        "product.*",
        "product.variants.*",
        "product.variants.calculated_price",
        "product.images.*",
      ],
    })
    const brandData = data[0] as any
    if (brandData?.product) linkedProducts.push(...brandData.product)
  } catch (e: any) {
    console.error("Brand linked-products query error:", e.message)
  }

  // 3. Regel-basiertes Matching: alle Produkte laden und filtern
  const ruleMatches: any[] = []
  if (ruleEnabled) {
    try {
      const { data: allProducts } = await query.graph({
        entity: "product",
        fields: [
          "id",
          "handle",
          "title",
          "description",
          "thumbnail",
          "status",
          "variants.*",
          "variants.calculated_price",
          "images.*",
        ],
      })

      for (const p of allProducts as any[]) {
        if (p.status && p.status !== "published") continue
        if (matchesRule(p, ruleType, ruleField, ruleValue)) {
          ruleMatches.push(p)
        }
      }
    } catch (e: any) {
      console.error("Brand rule-match query error:", e.message)
    }
  }

  // 4. Union + Dedupe
  const byId = new Map<string, any>()
  for (const p of linkedProducts) if (p?.id) byId.set(p.id, p)
  for (const p of ruleMatches) if (p?.id && !byId.has(p.id)) byId.set(p.id, p)
  const allProducts = Array.from(byId.values())

  const count = allProducts.length
  const products = allProducts.slice(skip, skip + take)

  res.json({
    products,
    count,
    offset: skip,
    limit: take,
    rule: {
      enabled: ruleEnabled,
      type: ruleType,
      field: ruleField,
      value: ruleValue,
      linked_count: linkedProducts.length,
      rule_match_count: ruleMatches.length,
    },
  })
}
