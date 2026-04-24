import { fetchPage } from "./client"

// ========== SHARED TYPES ==========
export interface SectionMedia {
  mediaType?: "none" | "image" | "video"
  image?: { asset: { _ref: string; url: string } }
  videoUrl?: string
  overlayOpacity?: number
}

// ========== HOME PAGE ==========
export interface HomePageData {
  heroBg?: SectionMedia
  heroBadge?: string
  heroHeadline?: string
  heroHeadlineHighlight?: string
  heroSubline?: string
  heroPrimaryCta?: { label: string; href: string }
  heroSecondaryCta?: { label: string; href: string }
  statsBg?: SectionMedia
  stats?: { value: string; label: string }[]
  servicesBg?: SectionMedia
  servicesHeading?: string
  servicesSubheading?: string
  services?: {
    icon: string
    title: string
    description: string
    href: string
    badge?: string
    highlight?: boolean
  }[]
  processBg?: SectionMedia
  processHeading?: string
  processSubheading?: string
  processSteps?: { number: string; title: string; description: string }[]
  featuredProductsBg?: SectionMedia
  featuredProductsHeading?: string
  featuredProductsSubheading?: string
  featuredProductHandles?: { handle: string; badge?: string }[]
  brandsBg?: SectionMedia
  brandsHeading?: string
  brandsSubheading?: string
  symptomsBg?: SectionMedia
  symptomsHeading?: string
  symptomsSubheading?: string
  symptomItems?: { icon?: string; title: string; description: string; severity: string; href: string }[]
  trustBg?: SectionMedia
  trustHeading?: string
  trustItems?: { icon: string; title: string; description: string }[]
  faqBg?: SectionMedia
  faqHeading?: string
  faqs?: { question: string; answer: string }[]
  ctaBg?: SectionMedia
  ctaHeading?: string
  ctaSubheading?: string
  ctaPrimaryCta?: { label: string; href: string }
  ctaSecondaryCta?: { label: string; href: string }
  seo?: { title: string; description: string }
}

const sectionMediaProjection = `{
  mediaType,
  image{ asset->{ _ref, url } },
  videoUrl,
  overlayOpacity
}`

const homePageQuery = `*[_type == "homePage"][0]{
  heroBg${sectionMediaProjection},
  heroBadge, heroHeadline, heroHeadlineHighlight, heroSubline,
  heroPrimaryCta, heroSecondaryCta,
  statsBg${sectionMediaProjection},
  stats[]{ _key, value, label },
  servicesBg${sectionMediaProjection},
  servicesHeading, servicesSubheading,
  services[]{ _key, icon, title, description, href, badge, highlight },
  processBg${sectionMediaProjection},
  processHeading, processSubheading,
  processSteps[]{ _key, number, title, description },
  featuredProductsBg${sectionMediaProjection},
  featuredProductsHeading, featuredProductsSubheading,
  featuredProductHandles[]{ _key, handle, badge },
  brandsBg${sectionMediaProjection},
  brandsHeading, brandsSubheading,
  symptomsBg${sectionMediaProjection},
  symptomsHeading, symptomsSubheading,
  symptomItems[]{ _key, icon, title, description, severity, href },
  trustBg${sectionMediaProjection},
  trustHeading, trustItems[]{ _key, icon, title, description },
  faqBg${sectionMediaProjection},
  faqHeading, faqs[]{ _key, question, answer },
  ctaBg${sectionMediaProjection},
  ctaHeading, ctaSubheading, ctaPrimaryCta, ctaSecondaryCta,
  seo
}`

export function getHomePage(isDraftMode?: boolean) {
  return fetchPage<HomePageData>(homePageQuery, undefined, isDraftMode)
}

// ========== LEGAL PAGE ==========
export interface LegalPageData {
  title: string
  slug: { current: string }
  body: any[]
  isPlaceholder?: boolean
  seo?: { title: string; description: string }
}

const legalPageQuery = `*[_type == "legalPage" && slug.current == $slug][0]{
  title, slug, body, isPlaceholder, seo
}`

export function getLegalPage(slug: string, isDraftMode?: boolean) {
  return fetchPage<LegalPageData>(legalPageQuery, { slug }, isDraftMode)
}

// ========== KONTAKT PAGE ==========
export interface KontaktPageData {
  heading?: string
  subheading?: string
  phone?: string
  email?: string
  address?: string
  openingHours?: { day: string; time: string }[]
  noteText?: string
  quickHelp?: { emoji: string; title: string; description: string; href: string }[]
  seo?: { title: string; description: string }
}

const kontaktPageQuery = `*[_type == "kontaktPage"][0]{
  heading, subheading, phone, email, address,
  openingHours[]{ _key, day, time },
  noteText,
  quickHelp[]{ _key, emoji, title, description, href },
  seo
}`

export function getKontaktPage(isDraftMode?: boolean) {
  return fetchPage<KontaktPageData>(kontaktPageQuery, undefined, isDraftMode)
}

// ========== REPARATUR PAGE ==========
export interface ReparaturPageData {
  heading?: string
  subheading?: string
  services?: {
    icon: string
    title: string
    price: string
    description: string
    features?: string[]
    highlight?: boolean
  }[]
  ctaHeading?: string
  ctaText?: string
  ctaPrimary?: { label: string; href: string }
  seo?: { title: string; description: string }
}

const reparaturPageQuery = `*[_type == "reparaturPage"][0]{
  heading, subheading,
  services[]{ _key, icon, title, price, description, features, highlight },
  ctaHeading, ctaText, ctaPrimary, seo
}`

export function getReparaturPage(isDraftMode?: boolean) {
  return fetchPage<ReparaturPageData>(reparaturPageQuery, undefined, isDraftMode)
}

// ========== FAQ PAGE ==========
export interface FaqPageData {
  heading?: string
  subheading?: string
  categories?: {
    categoryTitle: string
    items: { question: string; answer: string }[]
  }[]
  seo?: { title: string; description: string }
}

const faqPageQuery = `*[_type == "faqPage"][0]{
  heading, subheading,
  categories[]{ _key, categoryTitle, items[]{ _key, question, answer } },
  seo
}`

export function getFaqPage(isDraftMode?: boolean) {
  return fetchPage<FaqPageData>(faqPageQuery, undefined, isDraftMode)
}

// ========== VERGLEICH PAGE ==========
export interface VergleichPageData {
  heading?: string
  subheading?: string
  comparisonRows?: { aspect: string; repair: string; newBuy: string; winner: string }[]
  conclusionHeading?: string
  conclusionText?: string
  ctaPrimary?: { label: string; href: string }
  seo?: { title: string; description: string }
}

const vergleichPageQuery = `*[_type == "vergleichPage"][0]{
  heading, subheading,
  comparisonRows[]{ _key, aspect, repair, newBuy, winner },
  conclusionHeading, conclusionText, ctaPrimary, seo
}`

export function getVergleichPage(isDraftMode?: boolean) {
  return fetchPage<VergleichPageData>(vergleichPageQuery, undefined, isDraftMode)
}

// ========== B2B PAGE ==========
export interface B2bPageData {
  heading?: string
  subheading?: string
  benefits?: { icon: string; title: string; description: string }[]
  ctaHeading?: string
  ctaText?: string
  contactEmail?: string
  seo?: { title: string; description: string }
}

const b2bPageQuery = `*[_type == "b2bPage"][0]{
  heading, subheading,
  benefits[]{ _key, icon, title, description },
  ctaHeading, ctaText, contactEmail, seo
}`

export function getB2bPage(isDraftMode?: boolean) {
  return fetchPage<B2bPageData>(b2bPageQuery, undefined, isDraftMode)
}

// ========== WERKSTATT PAGE ==========
export interface WerkstattPageData {
  heading?: string
  subheading?: string
  address?: string
  phone?: string
  email?: string
  openingHours?: { day: string; time: string }[]
  features?: { icon: string; title: string; description: string }[]
  seo?: { title: string; description: string }
}

const werkstattPageQuery = `*[_type == "werkstattPage"][0]{
  heading, subheading, address, phone, email,
  openingHours[]{ _key, day, time },
  features[]{ _key, icon, title, description },
  seo
}`

export function getWerkstattPage(isDraftMode?: boolean) {
  return fetchPage<WerkstattPageData>(werkstattPageQuery, undefined, isDraftMode)
}

// ========== UEBER UNS PAGE ==========
export interface UeberUnsPageData {
  heading?: string
  introText?: string
  missionHeading?: string
  missionText?: string
  stats?: { value: string; label: string }[]
  standortHeading?: string
  standortText?: string
  seo?: { title: string; description: string }
}

const ueberUnsPageQuery = `*[_type == "ueberUnsPage"][0]{
  heading, introText, missionHeading, missionText,
  stats[]{ _key, value, label },
  standortHeading, standortText, seo
}`

export function getUeberUnsPage(isDraftMode?: boolean) {
  return fetchPage<UeberUnsPageData>(ueberUnsPageQuery, undefined, isDraftMode)
}

// ========== ERSATZAKKU PAGE ==========
export interface ErsatzakkuPageData {
  heading?: string
  subheading?: string
  advantages?: { icon: string; title: string; description: string }[]
  comparisonHeading?: string
  comparisonText?: string
  ctaPrimary?: { label: string; href: string }
  seo?: { title: string; description: string }
}

const ersatzakkuPageQuery = `*[_type == "ersatzakkuPage"][0]{
  heading, subheading,
  advantages[]{ _key, icon, title, description },
  comparisonHeading, comparisonText, ctaPrimary, seo
}`

export function getErsatzakkuPage(isDraftMode?: boolean) {
  return fetchPage<ErsatzakkuPageData>(ersatzakkuPageQuery, undefined, isDraftMode)
}

// ========== KI-CHECK PAGE ==========
export interface KiCheckPageData {
  heading?: string
  subheading?: string
  steps?: { number: string; title: string; description: string }[]
  alternativeText?: string
  seo?: { title: string; description: string }
}

const kiCheckPageQuery = `*[_type == "kiCheckPage"][0]{
  heading, subheading,
  steps[]{ _key, number, title, description },
  alternativeText, seo
}`

export function getKiCheckPage(isDraftMode?: boolean) {
  return fetchPage<KiCheckPageData>(kiCheckPageQuery, undefined, isDraftMode)
}

// ========== REPAIR SETTINGS (Singleton) ==========
export interface RepairGehauseOption {
  id: string
  label: string
  description: string
  severity: "ok" | "warn" | "danger" | "critical"
  warningText?: string
}
export interface RepairProblemOption {
  id: string
  label: string
  description?: string
}
export interface RepairDauerOption {
  id: string
  label: string
  hinweis?: string
}
export interface RepairPreisregel {
  problemId: string
  label: string
  minPreis: number
  maxPreis: number
  minPreisUeber60V?: number
  maxPreisUeber60V?: number
}
export interface RepairServiceCard {
  title: string
  preisText: string
  description: string
  color: "green" | "amber" | "blue"
}
export interface RepairSidebarPreis {
  label: string
  preis: string
  highlight?: boolean
}
export interface RepairTrustBadge {
  icon: string
  title: string
  description: string
}
export interface RepairProcessStep {
  title: string
  description: string
}
export interface RepairFaqItem {
  question: string
  answer: string
}
export interface RepairServiceItem {
  id: string
  title: string
  description: string
  icon?: string
  preis: number
  preisUeber60V?: number
  preisText?: string
  leistungen?: string[]
  hinweis?: string
  highlight?: boolean
}
export interface RepairSettingsData {
  // Gehäuse
  gehauseHeading?: string
  gehauseSubheading?: string
  gehauseOptions?: RepairGehauseOption[]
  // Probleme
  problemeHeading?: string
  problemeSubheading?: string
  problemeOptions?: RepairProblemOption[]
  beschreibungPlaceholder?: string
  beschreibungMinChars?: number
  // Dauer
  dauerHeading?: string
  dauerOptions?: RepairDauerOption[]
  // Preise
  preisregeln?: RepairPreisregel[]
  sidebarPreise?: RepairSidebarPreis[]
  sidebarHinweis?: string
  // Diagnose
  diagnosePreis?: number
  diagnoseLeistungen?: string[]
  diagnoseInfo?: string
  // Reparatur-Services
  reparaturServicesHeading?: string
  reparaturServicesSubheading?: string
  reparaturServiceItems?: RepairServiceItem[]
  // Services
  serviceCards?: RepairServiceCard[]
  zellentauschInfo?: string
  // Trust
  trustBadges?: RepairTrustBadge[]
  // Prozess
  processHeading?: string
  processSteps?: RepairProcessStep[]
  // FAQ
  faqHeading?: string
  faqItems?: RepairFaqItem[]
  // CTA
  ctaHeading?: string
  ctaSubheading?: string
  ctaPrimaryLabel?: string
  ctaSecondaryLabel?: string
  ctaSecondaryHref?: string
  // Texte
  garantieTitle?: string
  garantieText?: string
  nichtReparierbarHeading?: string
  nichtReparierbarItems?: string[]
  symptomTags?: string[]
  kiAnalyseDisclaimer?: string
}

const repairSettingsQuery = `*[_type == "repairSettings"][0]{
  gehauseHeading, gehauseSubheading,
  gehauseOptions[]{ id, label, description, severity, warningText },
  problemeHeading, problemeSubheading,
  problemeOptions[]{ id, label, description },
  beschreibungPlaceholder, beschreibungMinChars,
  dauerHeading,
  dauerOptions[]{ id, label, hinweis },
  preisregeln[]{ problemId, label, minPreis, maxPreis, minPreisUeber60V, maxPreisUeber60V },
  sidebarPreise[]{ label, preis, highlight },
  sidebarHinweis,
  diagnosePreis, diagnoseLeistungen, diagnoseInfo,
  reparaturServicesHeading, reparaturServicesSubheading,
  reparaturServiceItems[]{ id, title, description, icon, preis, preisUeber60V, preisText, leistungen, hinweis, highlight },
  serviceCards[]{ title, preisText, description, color },
  zellentauschInfo,
  trustBadges[]{ icon, title, description },
  processHeading,
  processSteps[]{ title, description },
  faqHeading,
  faqItems[]{ question, answer },
  ctaHeading, ctaSubheading, ctaPrimaryLabel, ctaSecondaryLabel, ctaSecondaryHref,
  garantieTitle, garantieText,
  nichtReparierbarHeading, nichtReparierbarItems,
  symptomTags, kiAnalyseDisclaimer
}`

export function getRepairSettings(isDraftMode?: boolean) {
  return fetchPage<RepairSettingsData>(repairSettingsQuery, undefined, isDraftMode)
}

// ========== BRAND CONTENT (per Brand) ==========
export interface BrandContentData {
  handle: string
  displayName?: string
  heroTitle?: string
  heroSubtitle?: string
  introHeading?: string
  intro?: string
  series?: { name: string; capacity: string; note: string }[]
  compatibleBrands?: string[]
  problemeHeading?: string
  problems?: {
    icon: string
    title: string
    description: string
    severity: "critical" | "warning" | "info"
  }[]
  faqHeading?: string
  faqs?: { question: string; answer: string }[]
  testimonials?: {
    name: string
    location: string
    rating: number
    text: string
  }[]
  ctaHeading?: string
  ctaSubheading?: string
  ctaPrimaryLabel?: string
  ctaSecondaryLabel?: string
  seo?: { title: string; description: string }
}

const brandContentQuery = `*[_type == "brandContent" && handle == $handle][0]{
  handle, displayName,
  heroTitle, heroSubtitle,
  introHeading, intro,
  series[]{ _key, name, capacity, note },
  compatibleBrands,
  problemeHeading,
  problems[]{ _key, icon, title, description, severity },
  faqHeading,
  faqs[]{ _key, question, answer },
  testimonials[]{ _key, name, location, rating, text },
  ctaHeading, ctaSubheading, ctaPrimaryLabel, ctaSecondaryLabel,
  seo
}`

export function getBrandContent(handle: string, isDraftMode?: boolean) {
  return fetchPage<BrandContentData>(brandContentQuery, { handle }, isDraftMode)
}

// ========== PRODUCT CONTENT (per Product) ==========
export interface ProductContentData {
  handle: string
  internalTitle?: string
  titleOverride?: string
  subtitle?: string
  shortDescription?: string
  descriptionHeading?: string
  description?: any[]
  descriptionPlain?: string
  serviceCardsHeading?: string
  serviceCards?: {
    title: string
    preisText: string
    description: string
    color: "green" | "amber" | "blue"
  }[]
  symptomTags?: string[]
  sidebarHeading?: string
  sidebarPreise?: { label: string; preis: string; highlight?: boolean }[]
  sidebarHinweis?: string
  nichtReparierbarHeading?: string
  nichtReparierbarItems?: string[]
  trustBadges?: { icon: string; title: string; description: string }[]
  processHeading?: string
  processSteps?: { title: string; description: string }[]
  garantieTitle?: string
  garantieText?: string
  faqHeading?: string
  faqItems?: { question: string; answer: string }[]
  ctaHeading?: string
  ctaSubheading?: string
  ctaPrimaryLabel?: string
  ctaSecondaryLabel?: string
  ctaSecondaryHref?: string
  seo?: { title: string; description: string }
}

const productContentQuery = `*[_type == "productContent" && handle == $handle][0]{
  handle, internalTitle,
  titleOverride, subtitle, shortDescription,
  descriptionHeading, description, descriptionPlain,
  serviceCardsHeading,
  serviceCards[]{ _key, title, preisText, description, color },
  symptomTags,
  sidebarHeading,
  sidebarPreise[]{ _key, label, preis, highlight },
  sidebarHinweis,
  nichtReparierbarHeading, nichtReparierbarItems,
  trustBadges[]{ _key, icon, title, description },
  processHeading,
  processSteps[]{ _key, title, description },
  garantieTitle, garantieText,
  faqHeading,
  faqItems[]{ _key, question, answer },
  ctaHeading, ctaSubheading, ctaPrimaryLabel, ctaSecondaryLabel, ctaSecondaryHref,
  seo
}`

export function getProductContent(handle: string, isDraftMode?: boolean) {
  return fetchPage<ProductContentData>(productContentQuery, { handle }, isDraftMode)
}
