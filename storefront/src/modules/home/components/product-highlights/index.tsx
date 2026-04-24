import LocalizedClientLink from "@modules/common/components/localized-client-link"
import SectionBackground from "@modules/common/components/section-background"
import { HomePageData } from "@lib/sanity/queries"

type HighlightProduct = {
  id: string
  handle: string
  title: string
  description: string | null
  thumbnail: string | null
  variants: { calculated_price?: { calculated_amount: number; currency_code: string } }[]
  badge?: string
}

const ProductHighlights = ({
  products,
  cms,
}: {
  products: HighlightProduct[]
  cms?: HomePageData | null
}) => {
  if (!products.length) return null

  return (
    <section className="relative overflow-hidden">
      <SectionBackground media={cms?.featuredProductsBg} />
      <div className="content-container relative z-10 py-16 small:py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl small:text-3xl font-bold text-grey-90 mb-4">
            {cms?.featuredProductsHeading || "Unsere Highlights"}
          </h2>
          <p className="text-grey-50 max-w-2xl mx-auto">
            {cms?.featuredProductsSubheading || "Ausgewaehlte Produkte aus unserem Shop"}
          </p>
        </div>

        <div className={`grid gap-4 small:gap-6 ${
          products.length <= 4
            ? "grid-cols-2 small:grid-cols-4"
            : "grid-cols-2 small:grid-cols-3 medium:grid-cols-5"
        }`}>
          {products.map((product) => {
            const price = product.variants?.[0]?.calculated_price

            return (
              <LocalizedClientLink
                key={product.id}
                href={`/products/${product.handle}`}
                className="group relative flex flex-col bg-white rounded-xl border border-grey-20 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all"
              >
                {product.badge && (
                  <span className="absolute top-2 left-2 z-10 px-2 py-1 text-xs font-semibold rounded-full bg-brand-500 text-white">
                    {product.badge}
                  </span>
                )}

                <div className="aspect-square bg-grey-5 flex items-center justify-center overflow-hidden">
                  {product.thumbnail ? (
                    <img
                      src={product.thumbnail}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="text-grey-30 text-4xl">📦</div>
                  )}
                </div>

                <div className="p-3 flex flex-col flex-1">
                  <h3 className="text-sm font-semibold text-grey-90 mb-1 line-clamp-2">
                    {product.title}
                  </h3>
                  {price && (
                    <p className="text-brand-600 font-bold text-sm mt-auto">
                      {(price.calculated_amount / 100).toLocaleString("de-DE", {
                        style: "currency",
                        currency: price.currency_code,
                      })}
                    </p>
                  )}
                </div>
              </LocalizedClientLink>
            )
          })}
        </div>

        <div className="text-center mt-8">
          <LocalizedClientLink
            href="/store"
            className="inline-flex items-center gap-2 text-brand-500 hover:text-brand-600 font-semibold transition-colors"
          >
            Alle Produkte ansehen
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </LocalizedClientLink>
        </div>
      </div>
    </section>
  )
}

export default ProductHighlights
