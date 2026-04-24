// GROQ queries for all pages

export const homePageQuery = `*[_type == "homePage"][0]{
  heroBadge, heroHeadline, heroHeadlineHighlight, heroSubline,
  heroPrimaryCta, heroSecondaryCta,
  stats,
  servicesHeading, servicesSubheading, services,
  processHeading, processSubheading, processSteps,
  brandsHeading, brandsSubheading,
  symptomsHeading, symptomsSubheading,
  trustHeading, trustItems,
  faqHeading, faqs,
  ctaHeading, ctaSubheading, ctaPrimaryCta, ctaSecondaryCta,
  seo
}`

export const legalPageQuery = `*[_type == "legalPage" && slug.current == $slug][0]{
  title, slug, body, isPlaceholder, seo
}`

export const reparaturPageQuery = `*[_type == "reparaturPage"][0]{
  heading, subheading, services, ctaHeading, ctaText, ctaPrimary, seo
}`

export const ersatzakkuPageQuery = `*[_type == "ersatzakkuPage"][0]{
  heading, subheading, advantages, comparisonHeading, comparisonText, ctaPrimary, seo
}`

export const kiCheckPageQuery = `*[_type == "kiCheckPage"][0]{
  heading, subheading, steps, alternativeText, seo
}`

export const b2bPageQuery = `*[_type == "b2bPage"][0]{
  heading, subheading, benefits, ctaHeading, ctaText, contactEmail, seo
}`

export const werkstattPageQuery = `*[_type == "werkstattPage"][0]{
  heading, subheading, address, phone, email, openingHours, features, mapEmbedUrl, seo
}`

export const ueberUnsPageQuery = `*[_type == "ueberUnsPage"][0]{
  heading, introText, missionHeading, missionText, stats, standortHeading, standortText, seo
}`

export const kontaktPageQuery = `*[_type == "kontaktPage"][0]{
  heading, subheading, phone, email, address, openingHours, noteText, quickHelp, seo
}`

export const faqPageQuery = `*[_type == "faqPage"][0]{
  heading, subheading, categories, seo
}`

export const vergleichPageQuery = `*[_type == "vergleichPage"][0]{
  heading, subheading, comparisonRows, conclusionHeading, conclusionText, ctaPrimary, seo
}`

export const ratgeberPageQuery = `*[_type == "ratgeberPage"][0]{
  heading, subheading, seo
}`

export const ratgeberArticlesQuery = `*[_type == "ratgeberArticle"] | order(publishedAt desc){
  title, slug, excerpt, coverImage, publishedAt
}`

export const ratgeberArticleQuery = `*[_type == "ratgeberArticle" && slug.current == $slug][0]{
  title, slug, excerpt, coverImage, body, publishedAt, seo
}`

export const markenPageQuery = `*[_type == "markenPage"][0]{
  heading, subheading, seo
}`

export const symptomePageQuery = `*[_type == "symptomePage"][0]{
  heading, subheading, ctaHeading, ctaText, seo
}`
