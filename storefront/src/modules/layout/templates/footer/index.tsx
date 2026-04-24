import { Text } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const footerLinks = {
  service: [
    { label: "Akku Reparatur", href: "/reparatur" },
    { label: "Ersatzakku", href: "/ersatzakku" },
    { label: "KI-Check", href: "/ki-check" },
    { label: "B2B / Haendler", href: "/b2b" },
    { label: "Werkstatt Berlin", href: "/werkstatt-berlin" },
    { label: "Reparatur-Status", href: "/account" },
  ],
  wissen: [
    { label: "Alle Marken", href: "/marken" },
    { label: "Symptom-Navigator", href: "/symptome" },
    { label: "Ratgeber", href: "/ratgeber" },
    { label: "Reparatur vs. Neukauf", href: "/vergleich" },
    { label: "FAQ", href: "/faq" },
    { label: "Ueber uns", href: "/ueber-uns" },
  ],
  legal: [
    { label: "Impressum", href: "/legal/impressum" },
    { label: "Datenschutz", href: "/legal/datenschutz" },
    { label: "AGB", href: "/legal/agb" },
    { label: "Widerruf", href: "/legal/widerruf" },
    { label: "Batteriegesetz", href: "/legal/batteriegesetz" },
    { label: "Versand", href: "/legal/versand" },
  ],
}

export default async function Footer() {
  return (
    <footer className="bg-[#0f172a] text-white">
      {/* Top description bar */}
      <div className="border-b border-white/10">
        <div className="content-container py-6">
          <p className="text-sm text-gray-400 max-w-2xl leading-relaxed">
            Professionelle E-Bike Akku Reparatur in Berlin. Zellentausch, Diagnose &amp; Service fuer alle Marken.
          </p>
        </div>
      </div>

      <div className="content-container pt-12 pb-8">
        {/* Top: Logo + Links */}
        <div className="grid grid-cols-1 xsmall:grid-cols-2 small:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <LocalizedClientLink
              href="/"
              className="text-2xl font-bold text-brand-400 hover:text-brand-300 transition-colors"
            >
              AkkuBooster
            </LocalizedClientLink>
            <p className="text-sm text-gray-400 mt-3 leading-relaxed">
              E-Bike &amp; E-Scooter Akku-Reparatur, Zellentausch und Diagnose.
              Werkstatt in Berlin, Versand DE/AT/CH.
            </p>
            <p className="text-sm text-gray-400 mt-4">
              Tel: +49 30 12345678
            </p>
          </div>

          {/* Service */}
          <div>
            <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wider mb-4">Service</h3>
            <ul className="space-y-2.5">
              {footerLinks.service.map((link) => (
                <li key={link.href}>
                  <LocalizedClientLink
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </LocalizedClientLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Wissen */}
          <div>
            <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wider mb-4">Wissen</h3>
            <ul className="space-y-2.5">
              {footerLinks.wissen.map((link) => (
                <li key={link.href}>
                  <LocalizedClientLink
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </LocalizedClientLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wider mb-4">Rechtliches</h3>
            <ul className="space-y-2.5">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <LocalizedClientLink
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </LocalizedClientLink>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 pt-6 flex flex-col xsmall:flex-row justify-between items-center gap-4">
          <Text className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} AkkuBooster. Alle Rechte vorbehalten.
          </Text>
          <Text className="text-xs text-gray-500">
            Versand: Deutschland, Oesterreich, Schweiz
          </Text>
        </div>
      </div>
    </footer>
  )
}
