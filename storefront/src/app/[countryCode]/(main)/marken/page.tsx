import { Metadata } from "next"
import Image from "next/image"
import { listBrands, Brand } from "@lib/data/akkubooster"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "Alle Marken | AkkuBooster",
  description: "25+ E-Bike und E-Scooter Akku-Marken. Finde deine Marke und starte die Reparatur.",
}

export default async function MarkenPage() {
  let brands: Brand[] = []
  try {
    const data = await listBrands({ limit: 200 })
    brands = data.brands
  } catch (e) {
    console.error("Failed to load brands:", e)
  }

  const featured = brands.filter((b) => b.is_featured)
  const other = brands.filter((b) => !b.is_featured)

  return (
    <>
      {/* Hero */}
      <section className="relative py-16 md:py-20 overflow-hidden" style={{ backgroundImage: 'url(/images/marken-hero.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="absolute inset-0 bg-black/60" />
        <div className="content-container relative z-10">
          <nav className="flex items-center gap-2 text-sm text-white/60 mb-6">
            <LocalizedClientLink href="/" className="hover:text-white">Startseite</LocalizedClientLink>
            <span>/</span>
            <span className="text-white">Marken</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Alle Marken
          </h1>
          <p className="text-white/80 max-w-2xl text-lg">
            Wir reparieren Akkus von ueber {brands.length} Herstellern. Waehle deine Marke fuer Details zu Reparatur-Optionen und Preisen.
          </p>
        </div>
      </section>

      <div className="content-container py-12">
      {/* Featured */}
      {featured.length > 0 && (
        <>
          <h2 className="text-lg font-semibold text-grey-70 mb-4">Top-Marken</h2>
          <div className="grid grid-cols-2 xsmall:grid-cols-3 small:grid-cols-4 medium:grid-cols-6 gap-4 mb-12">
            {featured.map((brand) => (
              <BrandCard key={brand.id} brand={brand} />
            ))}
          </div>
        </>
      )}

      {/* Alle weiteren */}
      {other.length > 0 && (
        <>
          <h2 className="text-lg font-semibold text-grey-70 mb-4">Weitere Marken</h2>
          <div className="grid grid-cols-2 xsmall:grid-cols-3 small:grid-cols-4 medium:grid-cols-6 gap-4">
            {other.map((brand) => (
              <BrandCard key={brand.id} brand={brand} />
            ))}
          </div>
        </>
      )}
    </div>
    </>
  )
}

function BrandCard({ brand }: { brand: Brand }) {
  return (
    <LocalizedClientLink
      href={`/marken/${brand.handle}`}
      className="flex flex-col items-center justify-center p-6 bg-white rounded-xl border border-grey-20 hover:border-brand-500 hover:shadow-lg transition-all group"
    >
      <div className="w-16 h-16 rounded-xl bg-grey-10 flex items-center justify-center mb-3 group-hover:bg-brand-50 transition-colors overflow-hidden">
        {brand.logo_url ? (
          <Image
            src={brand.logo_url}
            alt={brand.name}
            width={48}
            height={48}
            className="object-contain"
          />
        ) : (
          <span className="text-2xl font-bold text-grey-50 group-hover:text-brand-600 transition-colors">
            {brand.name.charAt(0)}
          </span>
        )}
      </div>
      <span className="text-sm font-medium text-grey-70 text-center">{brand.name}</span>
      {brand.country && (
        <span className="text-xs text-grey-40 mt-1">{brand.country}</span>
      )}
    </LocalizedClientLink>
  )
}
