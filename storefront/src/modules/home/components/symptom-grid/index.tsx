import { Symptom } from "@lib/data/akkubooster"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import SectionBackground from "@modules/common/components/section-background"
import DynamicIcon from "@modules/common/components/dynamic-icon"
import { HomePageData } from "@lib/sanity/queries"

const severityColors = {
  critical: "bg-red-50 border-red-200",
  warning: "bg-amber-50 border-amber-200",
  info: "bg-blue-50 border-blue-200",
}

const severityBadge = {
  critical: "bg-red-100 text-red-600",
  warning: "bg-amber-100 text-amber-600",
  info: "bg-blue-100 text-blue-600",
}

const severityIconBg = {
  critical: "bg-red-100 text-red-500",
  warning: "bg-amber-100 text-amber-500",
  info: "bg-blue-100 text-blue-500",
}

const SymptomGrid = ({ symptoms, cms }: { symptoms: Symptom[]; cms?: HomePageData | null }) => {
  const cmsItems = cms?.symptomItems
  const useCmsItems = cmsItems && cmsItems.length > 0

  return (
    <section className="relative bg-white overflow-hidden">
      <SectionBackground media={cms?.symptomsBg} />
      <div className="content-container relative z-10 py-16 small:py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl small:text-3xl font-bold text-grey-90 mb-4">
            {cms?.symptomsHeading || "Typische Akku-Probleme"}
          </h2>
          <p className="text-grey-50 max-w-2xl mx-auto">
            {cms?.symptomsSubheading || "Waehle dein Symptom — wir zeigen dir die beste Loesung."}
          </p>
        </div>

        <div className="grid grid-cols-1 xsmall:grid-cols-2 small:grid-cols-3 medium:grid-cols-4 gap-4">
          {useCmsItems
            ? cmsItems.map((item, i) => {
                const severity = (item.severity as keyof typeof severityColors) || "info"
                return (
                  <LocalizedClientLink
                    key={i}
                    href={item.href || "/symptome"}
                    className={`relative flex flex-col p-5 rounded-xl border transition-all hover:shadow-md hover:-translate-y-0.5 ${severityColors[severity]}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${severityIconBg[severity]}`}>
                        <DynamicIcon name={item.icon} fallback="AlertCircle" className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full mb-2 ${severityBadge[severity]}`}>
                          {severity === "critical" ? "Dringend" : severity === "warning" ? "Achtung" : "Info"}
                        </span>
                        <h3 className="text-base font-semibold text-grey-90 leading-tight">{item.title}</h3>
                        {item.description && (
                          <p className="text-sm text-grey-50 leading-relaxed mt-1">{item.description}</p>
                        )}
                      </div>
                    </div>
                  </LocalizedClientLink>
                )
              })
            : symptoms.map((symptom) => (
                <LocalizedClientLink
                  key={symptom.id}
                  href={`/symptome/${symptom.handle}`}
                  className={`relative flex flex-col p-5 rounded-xl border transition-all hover:shadow-md hover:-translate-y-0.5 ${severityColors[symptom.severity]}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${severityIconBg[symptom.severity]}`}>
                      <DynamicIcon name={symptom.icon} fallback="AlertCircle" className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full mb-2 ${severityBadge[symptom.severity]}`}>
                        {symptom.severity === "critical" ? "Dringend" : symptom.severity === "warning" ? "Achtung" : "Info"}
                      </span>
                      <h3 className="text-base font-semibold text-grey-90 leading-tight">{symptom.title}</h3>
                      {symptom.short_description && (
                        <p className="text-sm text-grey-50 leading-relaxed mt-1">{symptom.short_description}</p>
                      )}
                    </div>
                  </div>
                </LocalizedClientLink>
              ))}
        </div>

        <div className="text-center mt-10">
          <LocalizedClientLink
            href="/ki-check"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border-2 border-brand-500 text-brand-500 hover:bg-brand-500 hover:text-white font-semibold transition-all"
          >
            Kostenloser KI-Check
            <DynamicIcon name="ArrowRight" className="w-4 h-4" />
          </LocalizedClientLink>
        </div>
      </div>
    </section>
  )
}

export default SymptomGrid
