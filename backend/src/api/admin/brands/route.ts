import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BRAND_MODULE } from "../../../modules/brand"
import BrandModuleService from "../../../modules/brand/service"

/**
 * GET /admin/brands
 * Liefert alle Marken (inkl. service_prices) fuer das Admin-UI.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const brandService: BrandModuleService = req.scope.resolve(BRAND_MODULE)

  const { limit, offset, q } = req.query as Record<string, string>

  const filters: Record<string, any> = {}
  if (q) filters.name = { $like: `%${q}%` }

  const [brands, count] = await brandService.listAndCountBrands(filters, {
    take: limit ? parseInt(limit) : 200,
    skip: offset ? parseInt(offset) : 0,
    order: { sort_order: "ASC", name: "ASC" },
  })

  res.json({
    brands,
    count,
    offset: offset ? parseInt(offset) : 0,
    limit: limit ? parseInt(limit) : 200,
  })
}
