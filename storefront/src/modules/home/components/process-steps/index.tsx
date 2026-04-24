import SectionBackground from "@modules/common/components/section-background"
import { HomePageData } from "@lib/sanity/queries"

const defaultSteps = [
  { number: "1", title: "Akku einsenden", description: "Verpacke deinen Akku sicher und sende ihn mit dem kostenlosen Versandlabel an unsere Werkstatt." },
  { number: "2", title: "Diagnose", description: "Unsere Techniker pruefen deinen Akku innerhalb von 24 Stunden und erstellen ein transparentes Angebot." },
  { number: "3", title: "Reparatur", description: "Nach deiner Freigabe ersetzen wir die defekten Zellen und testen den Akku auf Herz und Nieren." },
  { number: "4", title: "Rueckversand", description: "Dein reparierter Akku kommt versichert zu dir zurueck — mit 12 Monaten Garantie." },
]

const ProcessSteps = ({ cms }: { cms?: HomePageData | null }) => {
  const steps = cms?.processSteps?.length ? cms.processSteps : defaultSteps

  return (
    <section className="relative bg-white text-white overflow-hidden">
      <SectionBackground media={cms?.processBg} />
      {/* Fallback background image when no CMS background */}
      {!cms?.processBg?.mediaType && (
        <div className="absolute inset-0" style={{ backgroundImage: 'url(/images/process-bg.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
          <div className="absolute inset-0 bg-black/50" />
        </div>
      )}
      <div className="content-container relative z-10 py-16 small:py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl small:text-3xl font-bold text-white mb-4">
            {cms?.processHeading || "So funktioniert es"}
          </h2>
          <p className="text-grey-20 max-w-2xl mx-auto">
            {cms?.processSubheading || "In 4 einfachen Schritten zu deinem reparierten Akku."}
          </p>
        </div>

        <div className="grid grid-cols-1 xsmall:grid-cols-2 small:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <div key={i} className="relative text-center">
              {i < steps.length - 1 && (
                <div className="hidden small:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-white/20" />
              )}
              <div className="relative z-10 w-16 h-16 mx-auto mb-4 bg-brand-500 text-white rounded-full flex items-center justify-center text-2xl font-bold">
                {step.number}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
              <p className="text-sm text-grey-20 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ProcessSteps
