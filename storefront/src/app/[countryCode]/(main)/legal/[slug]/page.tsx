import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getLegalPage } from "@lib/sanity/queries"
import { draftMode } from "next/headers"
import { SanityPortableText } from "@lib/sanity/portable-text"

type Props = { params: Promise<{ slug: string; countryCode: string }> }

// Fallback for legal pages not yet in Sanity
const fallbackPages: Record<string, { title: string; content: string }> = {
  impressum: {
    title: "Impressum",
    content: "Angaben gemaess § 5 TMG\n\nAkkuBooster\nPiesporterstr. 34\n13088 Berlin\n\nVertreten durch:\n[Name des Geschaeftsfuehrers]\n\nKontakt:\nTelefon: +49 30 12345678\nE-Mail: info@akkubooster.de",
  },
  datenschutz: {
    title: "Datenschutzerklaerung",
    content: "Diese Datenschutzerklaerung klaert Sie ueber die Art, den Umfang und Zweck der Verarbeitung von personenbezogenen Daten auf unserer Website auf.\n\nVerantwortlicher:\nAkkuBooster\nPiesporterstr. 34\n13088 Berlin\ninfo@akkubooster.de\n\nDiese Seite wird vor dem Go-Live mit der vollstaendigen DSGVO-konformen Datenschutzerklaerung ergaenzt.",
  },
  agb: {
    title: "Allgemeine Geschaeftsbedingungen",
    content: "Allgemeine Geschaeftsbedingungen der AkkuBooster fuer den Verkauf von Waren und Dienstleistungen.\n\n§1 Geltungsbereich\nDiese AGB gelten fuer alle Vertraege, die ueber unseren Online-Shop geschlossen werden.\n\nDiese Seite wird vor dem Go-Live mit den vollstaendigen AGB ergaenzt.",
  },
  widerruf: {
    title: "Widerrufsbelehrung",
    content: "Widerrufsrecht\n\nSie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gruenden diesen Vertrag zu widerrufen.\n\nDie Widerrufsfrist betraegt vierzehn Tage ab dem Tag, an dem Sie oder ein von Ihnen benannter Dritter die Waren in Besitz genommen haben.\n\nDiese Seite wird vor dem Go-Live mit der vollstaendigen Widerrufsbelehrung ergaenzt.",
  },
  batteriegesetz: {
    title: "Hinweise nach dem Batteriegesetz (BattG)",
    content: "Hinweise gemaess Batteriegesetz (BattG)\n\nAls Vertreiber von Batterien und Akkus sind wir nach dem Batteriegesetz (BattG) verpflichtet, unsere Kunden auf Folgendes hinzuweisen:\n\nBatterien und Akkumulatoren duerfen nicht im Hausmüll entsorgt werden.",
  },
  versand: {
    title: "Versandinformationen",
    content: "Versand & Lieferung\n\nVersandgebiete:\n- Deutschland: Kostenloser Hin- und Rueckversand\n- Oesterreich: Versandpauschale 9,90 EUR\n- Schweiz: Versandpauschale 14,90 EUR\n\nVersanddienstleister: DHL\n\nLieferzeiten:\n- Diagnose: 24 Stunden nach Eingang\n- Reparatur: 3–5 Werktage nach Freigabe",
  },
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = await props.params
  const draft = await draftMode()
  const cms = await getLegalPage(slug, draft.isEnabled)

  if (cms) {
    return {
      title: cms.seo?.title || `${cms.title} | AkkuBooster`,
    }
  }

  const fallback = fallbackPages[slug]
  if (!fallback) return { title: "Seite nicht gefunden | AkkuBooster" }
  return { title: `${fallback.title} | AkkuBooster` }
}

export default async function LegalPage(props: Props) {
  const { slug } = await props.params
  const draft = await draftMode()
  const cms = await getLegalPage(slug, draft.isEnabled)

  // CMS content available — render with Portable Text
  if (cms) {
    return (
      <div className="content-container py-12 max-w-3xl">
        <h1 className="text-3xl font-bold text-grey-90 mb-8">{cms.title}</h1>
        {cms.body ? (
          <div className="prose prose-grey max-w-none">
            <SanityPortableText value={cms.body} />
          </div>
        ) : (
          <p className="text-grey-50">Inhalt folgt.</p>
        )}
        {cms.isPlaceholder && (
          <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-sm text-amber-700">
              Diese Seite ist ein Platzhalter und wird vor dem Go-Live mit den finalen rechtlichen Texten ergaenzt.
            </p>
          </div>
        )}
      </div>
    )
  }

  // Fallback to hardcoded content
  const page = fallbackPages[slug]
  if (!page) {
    notFound()
  }

  return (
    <div className="content-container py-12 max-w-3xl">
      <h1 className="text-3xl font-bold text-grey-90 mb-8">{page.title}</h1>
      <div className="prose prose-grey max-w-none">
        {page.content.split("\n\n").map((paragraph, i) => (
          <p key={i} className="text-grey-60 mb-4 whitespace-pre-line">
            {paragraph}
          </p>
        ))}
      </div>
      <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <p className="text-sm text-amber-700">
          Diese Seite ist ein Platzhalter und wird vor dem Go-Live mit den finalen rechtlichen Texten ergaenzt.
        </p>
      </div>
    </div>
  )
}
