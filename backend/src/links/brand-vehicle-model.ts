import { defineLink } from "@medusajs/framework/utils"
import BrandModule from "../modules/brand"
import VehicleModelModule from "../modules/vehicle-model"

/**
 * Verknüpft Brand mit VehicleModels.
 * Ein VehicleModel gehört zu genau einer Marke.
 */
export default defineLink(
  BrandModule.linkable.brand,
  {
    linkable: VehicleModelModule.linkable.vehicleModel,
    isList: true,
  }
)
