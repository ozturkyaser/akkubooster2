import { defineLink } from "@medusajs/framework/utils"
import RepairOrderModule from "../modules/repair-order"
import OrderModule from "@medusajs/medusa/order"

/**
 * Optional: ein RepairOrder kann mit einem Medusa Order (Checkout) verknüpft
 * werden, sobald der Kunde das Angebot angenommen und die Reparatur gebucht hat.
 */
export default defineLink(
  OrderModule.linkable.order,
  RepairOrderModule.linkable.repairOrder
)
