import { model } from "@medusajs/framework/utils"

/**
 * VehicleModel — konkretes Fahrzeug/Akku-Modell einer Marke
 * z.B. "Bosch PowerPack 500", "Shimano STEPS BT-E8035"
 *
 * Über Module Link mit Brand verknüpft (siehe src/links/brand-vehicle-model.ts)
 */
const VehicleModel = model.define("vehicle_model", {
  id: model.id().primaryKey(),
  handle: model.text().unique(),
  name: model.text(),
  type: model.enum(["ebike", "escooter", "ecargo", "emoped", "other"]).default("ebike"),
  year_from: model.number().nullable(),
  year_to: model.number().nullable(),
  voltage: model.number().nullable(),           // z.B. 36, 48
  capacity_wh: model.number().nullable(),       // z.B. 500, 625
  capacity_ah: model.number().nullable(),       // z.B. 11, 13.4
  image_url: model.text().nullable(),
  description: model.text().nullable(),
  is_repairable: model.boolean().default(true),
  is_replaceable: model.boolean().default(true),
})

export default VehicleModel
