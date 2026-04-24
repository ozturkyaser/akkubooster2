import SectionBackground from "@modules/common/components/section-background"
import { HomePageData } from "@lib/sanity/queries"

const defaultStats = [
  { value: "2.500+", label: "Akkus repariert" },
  { value: "98%", label: "Kundenzufriedenheit" },
  { value: "24h", label: "Diagnose-Zeit" },
  { value: "12 Mon.", label: "Garantie" },
]

const Stats = ({ cms }: { cms?: HomePageData | null }) => {
  const stats = cms?.stats?.length ? cms.stats : defaultStats

  return (
    <section className="relative bg-grey-90 text-white overflow-hidden">
      <SectionBackground media={cms?.statsBg} />
      {/* Subtle background pattern when no CMS background */}
      {!cms?.statsBg?.mediaType && (
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        </div>
      )}
      <div className="content-container relative z-10 py-12">
        <div className="grid grid-cols-2 small:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl small:text-4xl font-bold text-brand-400 mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-grey-30">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Stats
