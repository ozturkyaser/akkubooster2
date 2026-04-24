import { defineLink } from "@medusajs/framework/utils"
import RepairOrderModule from "../modules/repair-order"
import CustomerModule from "@medusajs/medusa/customer"

/**
 * Ein Kunde kann mehrere RepairOrders haben.
 * Wird auf /account/bestellungen genutzt um die Liste anzuzeigen.
 */
export default defineLink(
  CustomerModule.linkable.customer,
  {
    linkable: RepairOrderModule.linkable.repairOrder,
    isList: true,
  }
)
