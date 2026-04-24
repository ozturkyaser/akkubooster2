import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { REPAIR_ORDER_MODULE } from "../../../modules/repair-order"
import RepairOrderModuleService from "../../../modules/repair-order/service"

/**
 * POST /store/repair-orders
 *
 * Erstellt einen neuen Reparatur-Auftrag.
 * Body:
 * {
 *   customer_email: "max@example.de",
 *   customer_name?: "Max Mustermann",
 *   customer_phone?: "+49 170 ...",
 *   brand_name?: "Bosch",
 *   vehicle_model_name?: "PowerPack 500",
 *   reported_symptoms?: [{ handle: "akku-laedt-nicht", title: "Akku lädt nicht" }],
 *   customer_notes?: "Seit Winter defekt",
 *   intake_photos?: ["url1", "url2"]
 * }
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const repairService: RepairOrderModuleService =
    req.scope.resolve(REPAIR_ORDER_MODULE)

  const body = req.body as Record<string, any>

  if (!body.customer_email) {
    res.status(400).json({
      type: "invalid_data",
      message: "customer_email ist erforderlich",
    })
    return
  }

  // Referenz generieren
  const reference = await repairService.generateReference()

  const [repairOrder] = await repairService.createRepairOrders([
    {
      reference,
      status: "received",
      customer_email: body.customer_email,
      customer_name: body.customer_name || null,
      customer_phone: body.customer_phone || null,
      brand_name: body.brand_name || null,
      vehicle_model_name: body.vehicle_model_name || null,
      reported_symptoms: body.reported_symptoms || null,
      customer_notes: body.customer_notes || null,
      intake_photos: body.intake_photos || null,
    } as any,
  ])

  // Timeline-Event: "Auftrag eingegangen"
  try {
    await repairService.createRepairTimelineEvents([
      {
        type: "status_change",
        title: "Reparatur-Auftrag eingegangen",
        description: `Auftrag ${reference} erstellt`,
        actor: "system",
        is_customer_visible: true,
        repair_order_id: repairOrder.id,
      } as any,
    ])
  } catch (e: any) {
    console.warn("Timeline-Event konnte nicht erstellt werden:", e.message)
  }

  res.status(201).json({ repair_order: repairOrder })
}
