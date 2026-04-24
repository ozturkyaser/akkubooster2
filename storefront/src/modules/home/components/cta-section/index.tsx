import LocalizedClientLink from "@modules/common/components/localized-client-link"
import SectionBackground from "@modules/common/components/section-background"
import { HomePageData } from "@lib/sanity/queries"

const CTASection = ({ cms }: { cms?: HomePageData | null }) => {
  return (
    <section className="relative bg-gradient-to-r from-brand-500 to-brand-700 text-white overflow-hidden">
      <SectionBackground media={cms?.ctaBg} />
      {/* Fallback background image when no CMS background */}
      {!cms?.ctaBg?.mediaType && (
        <div className="absolute inset-0" style={{ backgroundImage: 'url(/images/cta-bg.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
          <div className="absolute inset-0 bg-black/50" />
        </div>
      )}
      <div className="content-container relative z-10 py-16 small:py-20 text-center">
        <h2 className="text-2xl small:text-3xl font-bold mb-4">
          {cms?.ctaHeading || "Nicht sicher, was dein Akku hat?"}
        </h2>
        <p className="text-white/80 max-w-2xl mx-auto mb-8 text-lg">
          {cms?.ctaSubheading || "Lade ein Foto hoch und unsere KI analysiert deinen Akku — oder starte direkt ueber deine Marke."}
        </p>

        <div className="flex flex-col xsmall:flex-row justify-center gap-4">
          <LocalizedClientLink
            href={cms?.ctaPrimaryCta?.href || "/ki-check"}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-brand-600 font-semibold rounded-xl hover:bg-grey-5 transition-colors text-lg"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {cms?.ctaPrimaryCta?.label || "Foto hochladen"}
          </LocalizedClientLink>

          <LocalizedClientLink
            href={cms?.ctaSecondaryCta?.href || "/marken"}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white/40 hover:border-white font-semibold rounded-xl transition-colors text-lg"
          >
            {cms?.ctaSecondaryCta?.label || "Marke waehlen"}
          </LocalizedClientLink>
        </div>
      </div>
    </section>
  )
}

export default CTASection
