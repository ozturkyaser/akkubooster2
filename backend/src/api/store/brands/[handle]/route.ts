import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BRAND_MODULE } from "../../../../modules/brand"
import BrandModuleService from "../../../../modules/brand/service"

/**
 * GET /store/brands/:handle
 *
 * Einzelne Marke nach Handle (z.B. "bosch", "shimano")
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const brandService: BrandModuleService = req.scope.resolve(BRAND_MODULE)
  const { handle } = req.params

  const [brand] = await brandService.listBrands(
    { handle },
    { take: 1 }
  )

  if (!brand) {
    res.status(404).json({
      type: "not_found",
      message: `Marke '${handle}' nicht gefunden`,
    })
    return
  }

  res.json({ brand })
}
