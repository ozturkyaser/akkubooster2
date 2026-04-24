import { defineLink } from "@medusajs/framework/utils"
import SymptomModule from "../modules/symptom"
import ProductModule from "@medusajs/medusa/product"

/**
 * Ein Symptom kann mehrere empfohlene Produkte/Services haben.
 * z.B. "Akku lädt nicht" → "Diagnose-Service", "Zellentausch"
 */
export default defineLink(
  SymptomModule.linkable.symptom,
  {
    linkable: ProductModule.linkable.product,
    isList: true,
  }
)
