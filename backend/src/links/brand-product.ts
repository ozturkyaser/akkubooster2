import { defineLink } from "@medusajs/framework/utils"
import BrandModule from "../modules/brand"
import ProductModule from "@medusajs/medusa/product"

/**
 * Verknüpft Medusa Products mit unseren Brands.
 * Ein Produkt gehört zu genau einer Marke, eine Marke hat viele Produkte.
 */
export default defineLink(
  BrandModule.linkable.brand,
  {
    linkable: ProductModule.linkable.product,
    isList: true,
  }
)
