import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BRAND_MODULE } from "../../../modules/brand"
import BrandModuleService from "../../../modules/brand/service"

/**
 * GET /store/brands
 *
 * Query-Parameter:
 *   - featured=true    → nur featured Marken
 *   - limit=25         → Pagination
 *   - offset=0         → Pagination
 *   - q=bosch          → Suche im Namen
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const brandService: BrandModuleService = req.scope.resolve(BRAND_MODULE)

  const { featured, limit, offset, q } = req.query as Record<string, string>

  const filters: Record<string, any> = {}
  if (featured === "true") {
    filters.is_featured = true
  }
  if (q) {
    filters.name = { $like: `%${q}%` }
  }

  const [brands, count] = await brandService.listAndCountBrands(
    filters,
    {
      take: limit ? parseInt(limit) : 50,
      skip: offset ? parseInt(offset) : 0,
      order: { sort_order: "ASC" },
    }
  )

  res.json({
    brands,
    count,
    offset: offset ? parseInt(offset) : 0,
    limit: limit ? parseInt(limit) : 50,
  })
}
