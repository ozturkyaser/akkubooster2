import { MedusaService } from "@medusajs/framework/utils"
import VehicleModel from "./models/vehicle-model"

class VehicleModelModuleService extends MedusaService({
  VehicleModel,
}) {}

export default VehicleModelModuleService
