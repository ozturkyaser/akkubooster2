// Objects
export { seo } from "./objects/seo"
export { cta } from "./objects/cta"
export { blockContent } from "./objects/blockContent"
export { sectionMedia } from "./objects/sectionMedia"

// Documents
export { homePage } from "./documents/homePage"
export { legalPage } from "./documents/legalPage"
export { reparaturPage } from "./documents/reparaturPage"
export { ersatzakkuPage } from "./documents/ersatzakkuPage"
export { kiCheckPage } from "./documents/kiCheckPage"
export { b2bPage } from "./documents/b2bPage"
export { werkstattPage } from "./documents/werkstattPage"
export { ueberUnsPage } from "./documents/ueberUnsPage"
export { kontaktPage } from "./documents/kontaktPage"
export { faqPage } from "./documents/faqPage"
export { vergleichPage } from "./documents/vergleichPage"
export { ratgeberPage, ratgeberArticle } from "./documents/ratgeberPage"
export { markenPage, symptomePage } from "./documents/markenPage"
export { repairSettings } from "./documents/repairSettings"
export { brandContent } from "./documents/brandContent"
export { productContent } from "./documents/productContent"

// All schemas for Sanity Studio
import { seo } from "./objects/seo"
import { cta } from "./objects/cta"
import { blockContent } from "./objects/blockContent"
import { sectionMedia } from "./objects/sectionMedia"
import { homePage } from "./documents/homePage"
import { legalPage } from "./documents/legalPage"
import { reparaturPage } from "./documents/reparaturPage"
import { ersatzakkuPage } from "./documents/ersatzakkuPage"
import { kiCheckPage } from "./documents/kiCheckPage"
import { b2bPage } from "./documents/b2bPage"
import { werkstattPage } from "./documents/werkstattPage"
import { ueberUnsPage } from "./documents/ueberUnsPage"
import { kontaktPage } from "./documents/kontaktPage"
import { faqPage } from "./documents/faqPage"
import { vergleichPage } from "./documents/vergleichPage"
import { ratgeberPage, ratgeberArticle } from "./documents/ratgeberPage"
import { markenPage, symptomePage } from "./documents/markenPage"
import { repairSettings } from "./documents/repairSettings"
import { brandContent } from "./documents/brandContent"
import { productContent } from "./documents/productContent"

export const schemaTypes = [
  // Objects
  seo,
  cta,
  blockContent,
  sectionMedia,
  // Singletons (Pages)
  homePage,
  legalPage,
  reparaturPage,
  ersatzakkuPage,
  kiCheckPage,
  b2bPage,
  werkstattPage,
  ueberUnsPage,
  kontaktPage,
  faqPage,
  vergleichPage,
  ratgeberPage,
  ratgeberArticle,
  markenPage,
  symptomePage,
  repairSettings,
  // Per-Handle Content-Dokumente
  brandContent,
  productContent,
]
