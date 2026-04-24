import { Module } from "@medusajs/framework/utils"
import VehicleModelModuleService from "./service"

export const VEHICLE_MODEL_MODULE = "vehicle_model"

export default Module(VEHICLE_MODEL_MODULE, {
  service: VehicleModelModuleService,
})
