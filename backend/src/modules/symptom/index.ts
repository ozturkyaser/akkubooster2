import { Module } from "@medusajs/framework/utils"
import SymptomModuleService from "./service"

export const SYMPTOM_MODULE = "symptom"

export default Module(SYMPTOM_MODULE, {
  service: SymptomModuleService,
})
