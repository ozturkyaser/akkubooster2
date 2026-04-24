import LocalizedClientLink from "@modules/common/components/localized-client-link"
import SectionBackground from "@modules/common/components/section-background"
import DynamicIcon from "@modules/common/components/dynamic-icon"
import { HomePageData } from "@lib/sanity/queries"

const defaultServices = [
  { title: "Akku Reparatur", description: "Zellentausch und Reparatur. Wir ersetzen defekte Zellen und geben deinem Akku neue Kraft.", href: "/reparatur", icon: "Zap", badge: "Empfohlen", highlight: true },
  { title: "Ersatzakku", description: "Wenn eine Reparatur nicht mehr lohnt — passender Ersatzakku fuer dein E-Bike.", href: "/ersatzakku", icon: "Battery", highlight: false },
  { title: "Kostenloser Check", description: "Lade ein Foto hoch — unsere KI erkennt Marke, Modell und moegliche Schaeden in 60 Sekunden.", href: "/ki-check", icon: "CheckCircle", highlight: false },
  { title: "B2B / Haendler", description: "Mengenrabatte ab 10 Stueck, Rechnungskauf, dedizierter Ansprechpartner.", href: "/b2b", icon: "Building2", highlight: false },
]

const ServiceCards = ({ cms }: { cms?: HomePageData | null }) => {
  const services = cms?.services?.length ? cms.services : defaultServices

  return (
    <section className="relative bg-grey-5 overflow-hidden">
      <SectionBackground media={cms?.servicesBg} />
      <div className="content-container relative z-10 py-16 small:py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl small:text-3xl font-bold text-grey-90 mb-4">
            {cms?.servicesHeading || "Unsere Services"}
          </h2>
          <p className="text-grey-50 max-w-2xl mx-auto">
            {cms?.servicesSubheading || "Ob Reparatur, Ersatz oder Diagnose — wir finden die beste Loesung fuer deinen Akku."}
          </p>
        </div>

        <div className="grid grid-cols-1 xsmall:grid-cols-2 small:grid-cols-4 gap-6">
          {services.map((service, i) => (
            <LocalizedClientLink
              key={i}
              href={service.href}
              className={`relative flex flex-col p-6 rounded-xl border transition-all hover:shadow-lg hover:-translate-y-1 ${
                service.highlight
                  ? "bg-brand-500 text-white border-brand-500 hover:bg-brand-600"
                  : "bg-white text-grey-90 border-grey-20 hover:border-brand-500"
              }`}
            >
              {service.badge && (
                <span className={`absolute -top-3 left-4 px-3 py-1 text-xs font-semibold rounded-full ${
                  service.highlight ? "bg-white text-brand-600" : "bg-brand-500 text-white"
                }`}>
                  {service.badge}
                </span>
              )}

              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                service.highlight ? "bg-white/20" : "bg-brand-50"
              }`}>
                <DynamicIcon
                  name={service.icon}
                  fallback="Settings"
                  className={`w-6 h-6 ${service.highlight ? "text-white" : "text-brand-500"}`}
                />
              </div>

              <h3 className="text-lg font-semibold mb-2">{service.title}</h3>
              <p className={`text-sm leading-relaxed ${
                service.highlight ? "text-white/80" : "text-grey-50"
              }`}>
                {service.description}
              </p>
            </LocalizedClientLink>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ServiceCards
