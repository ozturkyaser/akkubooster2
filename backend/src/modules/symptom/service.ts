import { MedusaService } from "@medusajs/framework/utils"
import Symptom from "./models/symptom"

class SymptomModuleService extends MedusaService({
  Symptom,
}) {}

export default SymptomModuleService
