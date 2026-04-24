import { Metadata } from "next"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "Ratgeber | AkkuBooster",
  description: "Tipps und Wissen rund um E-Bike Akkus. Pflege, Lagerung, Lebensdauer und mehr.",
}

const articles = [
  { title: "Akku richtig lagern im Winter", desc: "Tipps fuer die sichere Winterlagerung deines E-Bike Akkus.", slug: "akku-winter-lagern" },
  { title: "Reichweite maximieren", desc: "So holst du die maximale Reichweite aus deinem E-Bike Akku.", slug: "reichweite-maximieren" },
  { title: "Wann lohnt sich eine Reparatur?", desc: "Reparatur vs. Neukauf — ein ehrlicher Vergleich.", slug: "reparatur-vs-neukauf" },
  { title: "Akku-Pflege im Alltag", desc: "Einfache Tipps fuer ein langes Akku-Leben.", slug: "akku-pflege" },
]

export default function RatgeberPage() {
  return (
    <div>
      {/* Hero Header */}
      <div className="w-full bg-gradient-to-br from-gray-900 to-gray-800 py-12 small:py-16">
        <div className="content-container">
          <h1 className="text-3xl small:text-4xl font-bold text-white mb-3">Ratgeber</h1>
          <p className="text-white/60 text-lg max-w-xl">
            Tipps und Wissen rund um E-Bike Akkus. Pflege, Lagerung, Lebensdauer und mehr.
          </p>
        </div>
      </div>

      <div className="content-container py-12">
        <div className="grid grid-cols-1 xsmall:grid-cols-2 gap-6">
          {articles.map((a, i) => (
            <div key={i} className="p-6 bg-white rounded-xl border border-grey-20 hover:border-brand-500 hover:shadow-md transition-all">
              <h3 className="text-lg font-semibold text-grey-90 mb-2">{a.title}</h3>
              <p className="text-sm text-grey-50 mb-4">{a.desc}</p>
              <span className="text-sm text-brand-500 font-medium">Demnachst verfuegbar</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
