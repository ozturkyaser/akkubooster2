import LocalizedClientLink from "@modules/common/components/localized-client-link"
import SectionBackground from "@modules/common/components/section-background"
import { HomePageData } from "@lib/sanity/queries"

const Hero = ({ cms }: { cms?: HomePageData | null }) => {
  const hasBgMedia = cms?.heroBg?.mediaType && cms.heroBg.mediaType !== "none"

  return (
    <section className="relative bg-gradient-to-br from-grey-90 via-grey-80 to-accent-500 text-white overflow-hidden">
      <SectionBackground media={cms?.heroBg} />
      {/* Fallback background image when no CMS background */}
      {!hasBgMedia && (
        <div className="absolute inset-0" style={{ backgroundImage: 'url(/images/hero-battery.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
          <div className="absolute inset-0 bg-black/60" />
        </div>
      )}

      <div className="content-container relative z-10 py-20 small:py-32">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur rounded-full text-sm mb-6">
            <span className="w-2 h-2 bg-brand-400 rounded-full animate-pulse" />
            <span>{cms?.heroBadge || "Werkstatt in Berlin \u2014 DE / AT / CH Versand"}</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl small:text-5xl font-bold leading-tight mb-6">
            {cms?.heroHeadline || "E-Bike Akku reparieren."}
            <br />
            <span className="text-brand-400">{cms?.heroHeadlineHighlight || "Schnell. Unkompliziert."}</span>
          </h1>

          {/* Subline */}
          <p className="text-lg small:text-xl text-grey-30 mb-10 max-w-2xl leading-relaxed">
            {cms?.heroSubline || "Zellentausch, Diagnose und Reparatur von E-Bike, E-Scooter und E-Cargo Akkus. 25+ Marken. Ab 299\u00a0EUR. 12 Monate Garantie."}
          </p>

          {/* Dual CTA */}
          <div className="flex flex-col xsmall:flex-row gap-4">
            <LocalizedClientLink
              href={cms?.heroPrimaryCta?.href || "/ki-check"}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors text-lg"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {cms?.heroPrimaryCta?.label || "Kostenloser KI-Check"}
            </LocalizedClientLink>

            <LocalizedClientLink
              href={cms?.heroSecondaryCta?.href || "/marken"}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white/30 hover:border-white/60 text-white font-semibold rounded-xl transition-colors text-lg"
            >
              {cms?.heroSecondaryCta?.label || "Marke auswaehlen"}
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </LocalizedClientLink>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
