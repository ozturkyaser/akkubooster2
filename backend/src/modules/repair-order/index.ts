import { Module } from "@medusajs/framework/utils"
import RepairOrderModuleService from "./service"

export const REPAIR_ORDER_MODULE = "repair_order"

export default Module(REPAIR_ORDER_MODULE, {
  service: RepairOrderModuleService,
})
