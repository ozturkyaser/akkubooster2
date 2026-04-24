import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { VEHICLE_MODEL_MODULE } from "../../../modules/vehicle-model"
import VehicleModelModuleService from "../../../modules/vehicle-model/service"

/**
 * GET /store/vehicle-models
 *
 * Query-Parameter:
 *   - type=ebike|escooter|ecargo|emoped
 *   - limit=50
 *   - offset=0
 *   - q=powerpack      → Suche im Namen
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const vehicleModelService: VehicleModelModuleService =
    req.scope.resolve(VEHICLE_MODEL_MODULE)

  const { type, limit, offset, q } = req.query as Record<string, string>

  const filters: Record<string, any> = {}
  if (type) {
    filters.type = type
  }
  if (q) {
    filters.name = { $like: `%${q}%` }
  }

  const [models, count] = await vehicleModelService.listAndCountVehicleModels(
    filters,
    {
      take: limit ? parseInt(limit) : 50,
      skip: offset ? parseInt(offset) : 0,
      order: { name: "ASC" },
    }
  )

  res.json({
    vehicle_models: models,
    count,
    offset: offset ? parseInt(offset) : 0,
    limit: limit ? parseInt(limit) : 50,
  })
}
