import { Metadata } from "next"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { getVergleichPage } from "@lib/sanity/queries"
import { draftMode } from "next/headers"

const defaultComparison = [
  { aspect: "Kosten", repair: "Ab 299 EUR", newBuy: "500–1.200 EUR", winner: "repair" },
  { aspect: "Wartezeit", repair: "3–5 Werktage", newBuy: "Sofort (wenn verfuegbar)", winner: "new" },
  { aspect: "Nachhaltigkeit", repair: "Sehr gut — weniger Elektroschrott", newBuy: "Schlecht — alter Akku wird Muell", winner: "repair" },
  { aspect: "Kapazitaet", repair: "Wie neu (neue Zellen)", newBuy: "Wie neu", winner: "tie" },
  { aspect: "Garantie", repair: "12 Monate", newBuy: "12–24 Monate", winner: "new" },
  { aspect: "Kompatibilitaet", repair: "Garantiert — gleicher Akku", newBuy: "Muss geprueft werden", winner: "repair" },
]

export async function generateMetadata(): Promise<Metadata> {
  const cms = await getVergleichPage(false)
  return {
    title: cms?.seo?.title || "Reparatur vs. Neukauf | AkkuBooster",
    description: cms?.seo?.description || "Lohnt sich die Reparatur oder ist ein Neukauf besser? Ehrlicher Vergleich.",
  }
}

export default async function VergleichPage() {
  const draft = await draftMode()
  const cms = await getVergleichPage(draft.isEnabled)

  const comparison = cms?.comparisonRows?.length ? cms.comparisonRows : defaultComparison

  return (
    <div>
      {/* Hero Header */}
      <div className="w-full bg-gradient-to-br from-brand-700 to-brand-900 py-12 small:py-16">
        <div className="content-container max-w-4xl">
          <h1 className="text-3xl small:text-4xl font-bold text-white mb-3">
            {cms?.heading || "Reparatur vs. Neukauf"}
          </h1>
          <p className="text-white/60 text-lg">
            {cms?.subheading || "Ein ehrlicher Vergleich — was lohnt sich fuer dich?"}
          </p>
        </div>
      </div>

      <div className="content-container py-12 max-w-4xl">
        <div className="overflow-x-auto mb-12">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b-2 border-grey-20">
                <th className="py-3 pr-4 text-sm font-semibold text-grey-60">Kriterium</th>
                <th className="py-3 px-4 text-sm font-semibold text-brand-600">Reparatur</th>
                <th className="py-3 pl-4 text-sm font-semibold text-grey-60">Neukauf</th>
              </tr>
            </thead>
            <tbody>
              {comparison.map((row, i) => (
                <tr key={i} className="border-b border-grey-10">
                  <td className="py-4 pr-4 font-medium text-grey-80">{row.aspect}</td>
                  <td className={`py-4 px-4 text-sm ${row.winner === "repair" ? "text-brand-600 font-semibold bg-brand-50/50" : "text-grey-60"}`}>
                    {row.repair}
                  </td>
                  <td className={`py-4 pl-4 text-sm ${row.winner === "new" ? "text-grey-80 font-semibold bg-grey-5" : "text-grey-60"}`}>
                    {row.newBuy}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-brand-50 border border-brand-200 rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold text-brand-700 mb-3">
            {cms?.conclusionHeading || "Fazit: Reparatur lohnt sich meist"}
          </h2>
          <p className="text-brand-600 mb-6">
            {cms?.conclusionText || "Bis zu 60% guenstiger, nachhaltiger und genauso leistungsfaehig."}
          </p>
          <LocalizedClientLink href={cms?.ctaPrimary?.href || "/ki-check"} className="px-6 py-3 bg-brand-500 text-white font-semibold rounded-xl hover:bg-brand-600 transition-colors inline-block">
            {cms?.ctaPrimary?.label || "Kostenlos pruefen lassen"}
          </LocalizedClientLink>
        </div>
      </div>
    </div>
  )
}
