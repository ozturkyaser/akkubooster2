import Image from "next/image"
import { Brand } from "@lib/data/akkubooster"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import SectionBackground from "@modules/common/components/section-background"
import { HomePageData } from "@lib/sanity/queries"

const BrandGrid = ({
  brands,
  cms,
}: {
  brands: Brand[]
  cms?: HomePageData | null
}) => {
  return (
    <section className="relative bg-grey-5 border-t border-grey-20 overflow-hidden">
      <SectionBackground media={cms?.brandsBg} />
      <div className="content-container relative z-10 py-16 small:py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl small:text-3xl font-bold text-grey-90 mb-4">
            {cms?.brandsHeading || "Wir reparieren alle Marken"}
          </h2>
          <p className="text-grey-50 max-w-2xl mx-auto">
            {cms?.brandsSubheading ||
              "Von Bosch bis Shimano — professionelle Reparatur fuer alle E-Bike Akku-Hersteller."}
          </p>
        </div>

        <div className="grid grid-cols-2 xsmall:grid-cols-3 small:grid-cols-4 medium:grid-cols-6 gap-5">
          {brands.map((brand) => (
            <LocalizedClientLink
              key={brand.id}
              href={`/marken/${brand.handle}`}
              className="flex flex-col items-center justify-center p-5 bg-white rounded-xl border border-grey-20 hover:border-brand-500 hover:shadow-lg transition-all group"
            >
              {brand.logo_url ? (
                <div className="w-16 h-16 relative mb-3 flex items-center justify-center">
                  <Image
                    src={brand.logo_url}
                    alt={brand.name}
                    width={64}
                    height={64}
                    className="object-contain max-h-16 group-hover:scale-105 transition-transform"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-xl bg-grey-10 flex items-center justify-center mb-3 group-hover:bg-brand-50 transition-colors">
                  <span className="text-2xl font-bold text-grey-50 group-hover:text-brand-600 transition-colors">
                    {brand.name.charAt(0)}
                  </span>
                </div>
              )}
              <span className="text-sm text-grey-70 text-center font-medium truncate w-full">
                {brand.name}
              </span>
            </LocalizedClientLink>
          ))}
        </div>

        <div className="text-center mt-10">
          <LocalizedClientLink
            href="/marken"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border-2 border-brand-500 text-brand-500 hover:bg-brand-500 hover:text-white font-semibold transition-all"
          >
            Alle Marken anzeigen
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </LocalizedClientLink>
        </div>
      </div>
    </section>
  )
}

export default BrandGrid
