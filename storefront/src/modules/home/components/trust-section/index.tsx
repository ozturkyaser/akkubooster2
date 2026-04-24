import SectionBackground from "@modules/common/components/section-background"
import DynamicIcon from "@modules/common/components/dynamic-icon"
import { HomePageData } from "@lib/sanity/queries"

const defaultTrustItems = [
  { icon: "ShieldCheck", title: "Zertifizierte Partner", description: "Geprueft und zugelassen fuer alle gaengigen Akku-Systeme" },
  { icon: "Cpu", title: "KI-Diagnose", description: "Sofortige Schadenserkennung per Foto-Upload" },
  { icon: "Truck", title: "Kostenloser Versand", description: "Hin- und Rueckversand innerhalb DE kostenlos" },
  { icon: "BadgeEuro", title: "Transparente Preise", description: "Ab 299 EUR — keine versteckten Kosten" },
  { icon: "Leaf", title: "Nachhaltigkeit", description: "Reparieren statt wegwerfen — gut fuer die Umwelt" },
  { icon: "Eye", title: "Live-Tracking", description: "Verfolge den Status deiner Reparatur in Echtzeit" },
]

const TrustSection = ({ cms }: { cms?: HomePageData | null }) => {
  const trustItems = cms?.trustItems?.length ? cms.trustItems : defaultTrustItems

  return (
    <section className="relative bg-grey-5 border-t border-grey-20 overflow-hidden">
      <SectionBackground media={cms?.trustBg} />
      {/* Fallback background image when no CMS background */}
      {!cms?.trustBg?.mediaType && (
        <div className="absolute inset-0" style={{ backgroundImage: 'url(/images/trust-bg.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
          <div className="absolute inset-0 bg-white/80" />
        </div>
      )}
      <div className="content-container relative z-10 py-16 small:py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl small:text-3xl font-bold text-grey-90 mb-4">
            {cms?.trustHeading || "Warum AkkuBooster?"}
          </h2>
        </div>

        <div className="grid grid-cols-2 small:grid-cols-3 medium:grid-cols-6 gap-6">
          {trustItems.map((item, i) => (
            <div key={i} className="text-center">
              <div className="w-14 h-14 mx-auto mb-3 rounded-xl bg-brand-50 flex items-center justify-center">
                <DynamicIcon
                  name={item.icon}
                  fallback="Star"
                  className="w-7 h-7 text-brand-500"
                />
              </div>
              <h3 className="text-sm font-semibold text-grey-90 mb-1">{item.title}</h3>
              <p className="text-xs text-grey-50 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default TrustSection
