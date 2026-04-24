import { defineField, defineType } from "sanity"

export const homePage = defineType({
  name: "homePage",
  title: "Startseite",
  type: "document",
  groups: [
    { name: "hero", title: "Hero" },
    { name: "stats", title: "Statistiken" },
    { name: "services", title: "Services" },
    { name: "process", title: "Ablauf" },
    { name: "featuredProducts", title: "Produkt-Highlights" },
    { name: "brands", title: "Marken-Intro" },
    { name: "symptoms", title: "Symptome-Intro" },
    { name: "trust", title: "Vertrauen" },
    { name: "faq", title: "FAQ" },
    { name: "cta", title: "CTA" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    // === HERO ===
    defineField({
      name: "heroBg",
      title: "Hero Hintergrund",
      type: "sectionMedia",
      group: "hero",
    }),
    defineField({
      name: "heroBadge",
      title: "Hero Badge",
      type: "string",
      group: "hero",
    }),
    defineField({
      name: "heroHeadline",
      title: "Headline",
      type: "string",
      group: "hero",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "heroHeadlineHighlight",
      title: "Highlight-Wort (gruen)",
      type: "string",
      group: "hero",
    }),
    defineField({
      name: "heroSubline",
      title: "Subline",
      type: "text",
      rows: 2,
      group: "hero",
    }),
    defineField({
      name: "heroPrimaryCta",
      title: "Primaerer CTA",
      type: "cta",
      group: "hero",
    }),
    defineField({
      name: "heroSecondaryCta",
      title: "Sekundaerer CTA",
      type: "cta",
      group: "hero",
    }),

    // === STATS ===
    defineField({
      name: "statsBg",
      title: "Statistiken Hintergrund",
      type: "sectionMedia",
      group: "stats",
    }),
    defineField({
      name: "stats",
      title: "Statistiken",
      type: "array",
      group: "stats",
      of: [
        {
          type: "object",
          fields: [
            { name: "value", type: "string", title: "Wert" },
            { name: "label", type: "string", title: "Label" },
          ],
        },
      ],
      validation: (r) => r.max(6),
    }),

    // === SERVICES ===
    defineField({
      name: "servicesBg",
      title: "Services Hintergrund",
      type: "sectionMedia",
      group: "services",
    }),
    defineField({
      name: "servicesHeading",
      title: "Ueberschrift",
      type: "string",
      group: "services",
    }),
    defineField({
      name: "servicesSubheading",
      title: "Unterueberschrift",
      type: "text",
      rows: 2,
      group: "services",
    }),
    defineField({
      name: "services",
      title: "Service-Karten",
      type: "array",
      group: "services",
      of: [
        {
          type: "object",
          fields: [
            { name: "icon", type: "string", title: "Icon (Lucide Name)", description: "Lucide Icon-Name, z.B. Wrench, Battery, Shield — lucide.dev/icons", options: {
              list: [
                { title: "🔧 Wrench", value: "Wrench" },
                { title: "🔋 Battery", value: "Battery" },
                { title: "🔋⚡ BatteryCharging", value: "BatteryCharging" },
                { title: "⚡ Zap", value: "Zap" },
                { title: "🛡 Shield", value: "Shield" },
                { title: "🛡✓ ShieldCheck", value: "ShieldCheck" },
                { title: "⚙ Settings", value: "Settings" },
                { title: "🔨 Hammer", value: "Hammer" },
                { title: "📦 Package", value: "Package" },
                { title: "🚚 Truck", value: "Truck" },
                { title: "📍 MapPin", value: "MapPin" },
                { title: "📞 Phone", value: "Phone" },
                { title: "✉ Mail", value: "Mail" },
                { title: "🔍 Search", value: "Search" },
                { title: "⭐ Star", value: "Star" },
                { title: "✓○ CheckCircle", value: "CheckCircle" },
                { title: "🎯 Target", value: "Target" },
                { title: "🚲 Bike", value: "Bike" },
                { title: "📄 FileText", value: "FileText" },
                { title: "🏆 Award", value: "Award" },
                { title: "⏰ Clock", value: "Clock" },
                { title: "🔥 Flame", value: "Flame" },
                { title: "❄ Snowflake", value: "Snowflake" },
                { title: "🌡 Thermometer", value: "Thermometer" },
              ],
            }},
            { name: "title", type: "string", title: "Titel" },
            { name: "description", type: "text", title: "Beschreibung" },
            { name: "href", type: "string", title: "Link" },
            { name: "badge", type: "string", title: "Badge (optional)" },
            { name: "highlight", type: "boolean", title: "Hervorgehoben?" },
          ],
        },
      ],
    }),

    // === PROCESS ===
    defineField({
      name: "processBg",
      title: "Ablauf Hintergrund",
      type: "sectionMedia",
      group: "process",
    }),
    defineField({
      name: "processHeading",
      title: "Ueberschrift",
      type: "string",
      group: "process",
    }),
    defineField({
      name: "processSubheading",
      title: "Unterueberschrift",
      type: "text",
      rows: 2,
      group: "process",
    }),
    defineField({
      name: "processSteps",
      title: "Schritte",
      type: "array",
      group: "process",
      of: [
        {
          type: "object",
          fields: [
            { name: "number", type: "string", title: "Nummer" },
            { name: "title", type: "string", title: "Titel" },
            { name: "description", type: "string", title: "Beschreibung" },
          ],
        },
      ],
    }),

    // === FEATURED PRODUCTS ===
    defineField({
      name: "featuredProductsBg",
      title: "Produkt-Highlights Hintergrund",
      type: "sectionMedia",
      group: "featuredProducts",
    }),
    defineField({
      name: "featuredProductsHeading",
      title: "Ueberschrift",
      type: "string",
      group: "featuredProducts",
    }),
    defineField({
      name: "featuredProductsSubheading",
      title: "Unterueberschrift",
      type: "text",
      rows: 2,
      group: "featuredProducts",
    }),
    defineField({
      name: "featuredProductHandles",
      title: "Produkt-Handles (aus Medusa)",
      description: "4-5 Produkt-Handles aus dem Shop eintragen",
      type: "array",
      group: "featuredProducts",
      of: [
        {
          type: "object",
          fields: [
            { name: "handle", type: "string", title: "Produkt-Handle" },
            { name: "badge", type: "string", title: "Badge (optional, z.B. 'Bestseller')" },
          ],
        },
      ],
      validation: (r) => r.max(5),
    }),

    // === BRANDS INTRO ===
    defineField({
      name: "brandsBg",
      title: "Marken Hintergrund",
      type: "sectionMedia",
      group: "brands",
    }),
    defineField({
      name: "brandsHeading",
      title: "Marken Ueberschrift",
      type: "string",
      group: "brands",
    }),
    defineField({
      name: "brandsSubheading",
      title: "Marken Unterueberschrift",
      type: "text",
      rows: 2,
      group: "brands",
    }),

    // === SYMPTOMS INTRO ===
    defineField({
      name: "symptomsBg",
      title: "Symptome Hintergrund",
      type: "sectionMedia",
      group: "symptoms",
    }),
    defineField({
      name: "symptomsHeading",
      title: "Symptome Ueberschrift",
      type: "string",
      group: "symptoms",
    }),
    defineField({
      name: "symptomsSubheading",
      title: "Symptome Unterueberschrift",
      type: "text",
      rows: 2,
      group: "symptoms",
    }),
    defineField({
      name: "symptomItems",
      title: "Symptom-Karten (ueberschreiben Medusa-Daten)",
      type: "array",
      group: "symptoms",
      description: "Wenn leer, werden Symptome aus Medusa geladen",
      of: [
        {
          type: "object",
          fields: [
            { name: "icon", type: "string", title: "Icon (Lucide Name)", description: "z.B. BatteryWarning, Zap, AlertTriangle, Flame, Snowflake — alle Icons: lucide.dev/icons", options: {
              list: [
                { title: "🔋 Battery", value: "Battery" },
                { title: "🔋⚡ BatteryCharging", value: "BatteryCharging" },
                { title: "🔋✓ BatteryFull", value: "BatteryFull" },
                { title: "🔋↓ BatteryLow", value: "BatteryLow" },
                { title: "🔋½ BatteryMedium", value: "BatteryMedium" },
                { title: "🔋⚠ BatteryWarning", value: "BatteryWarning" },
                { title: "⚡ Zap", value: "Zap" },
                { title: "⚡✕ ZapOff", value: "ZapOff" },
                { title: "🔌 Plug", value: "Plug" },
                { title: "🔌⚡ PlugZap", value: "PlugZap" },
                { title: "⏻ PowerOff", value: "PowerOff" },
                { title: "⏻ Power", value: "Power" },
                { title: "⚠ AlertTriangle", value: "AlertTriangle" },
                { title: "⚠○ AlertCircle", value: "AlertCircle" },
                { title: "⛔ AlertOctagon", value: "AlertOctagon" },
                { title: "✓○ CheckCircle", value: "CheckCircle" },
                { title: "✕○ XCircle", value: "XCircle" },
                { title: "ℹ Info", value: "Info" },
                { title: "❓ HelpCircle", value: "HelpCircle" },
                { title: "🔧 Wrench", value: "Wrench" },
                { title: "⚙ Settings", value: "Settings" },
                { title: "🔨 Hammer", value: "Hammer" },
                { title: "🚚 Truck", value: "Truck" },
                { title: "📦 Package", value: "Package" },
                { title: "📍 MapPin", value: "MapPin" },
                { title: "🌡 Thermometer", value: "Thermometer" },
                { title: "🌡☀ ThermometerSun", value: "ThermometerSun" },
                { title: "❄ Snowflake", value: "Snowflake" },
                { title: "🔥 Flame", value: "Flame" },
                { title: "☀ Sun", value: "Sun" },
                { title: "📉 TrendingDown", value: "TrendingDown" },
                { title: "📈 TrendingUp", value: "TrendingUp" },
                { title: "📊 Activity", value: "Activity" },
                { title: "🛡 Shield", value: "Shield" },
                { title: "🛡✓ ShieldCheck", value: "ShieldCheck" },
                { title: "🔒 Lock", value: "Lock" },
                { title: "📞 Phone", value: "Phone" },
                { title: "✉ Mail", value: "Mail" },
                { title: "⏰ Clock", value: "Clock" },
                { title: "⏱ Timer", value: "Timer" },
                { title: "✓ Check", value: "Check" },
                { title: "🔍 Search", value: "Search" },
                { title: "⭐ Star", value: "Star" },
                { title: "🏆 Award", value: "Award" },
                { title: "🎯 Target", value: "Target" },
                { title: "🚲 Bike", value: "Bike" },
                { title: "👥 Users", value: "Users" },
                { title: "📄 FileText", value: "FileText" },
                { title: "📋 ClipboardList", value: "ClipboardList" },
              ],
            }},
            { name: "title", type: "string", title: "Titel" },
            { name: "description", type: "text", title: "Beschreibung", rows: 2 },
            { name: "severity", type: "string", title: "Schweregrad", options: {
              list: [
                { title: "Kritisch", value: "critical" },
                { title: "Warnung", value: "warning" },
                { title: "Info", value: "info" },
              ],
            }},
            { name: "href", type: "string", title: "Link" },
          ],
        },
      ],
    }),

    // === TRUST ===
    defineField({
      name: "trustBg",
      title: "Vertrauen Hintergrund",
      type: "sectionMedia",
      group: "trust",
    }),
    defineField({
      name: "trustHeading",
      title: "Ueberschrift",
      type: "string",
      group: "trust",
    }),
    defineField({
      name: "trustItems",
      title: "Vertrauens-Elemente",
      type: "array",
      group: "trust",
      of: [
        {
          type: "object",
          fields: [
            { name: "icon", type: "string", title: "Icon (Lucide Name)", description: "Lucide Icon-Name — lucide.dev/icons", options: {
              list: [
                { title: "🛡 Shield", value: "Shield" },
                { title: "🛡✓ ShieldCheck", value: "ShieldCheck" },
                { title: "✓○ CheckCircle", value: "CheckCircle" },
                { title: "⭐ Star", value: "Star" },
                { title: "🏆 Award", value: "Award" },
                { title: "🔒 Lock", value: "Lock" },
                { title: "⏰ Clock", value: "Clock" },
                { title: "🚚 Truck", value: "Truck" },
                { title: "✓ Check", value: "Check" },
                { title: "📞 Phone", value: "Phone" },
                { title: "👥 Users", value: "Users" },
                { title: "❤ Heart", value: "Heart" },
                { title: "🎯 Target", value: "Target" },
                { title: "🔧 Wrench", value: "Wrench" },
                { title: "🔋 Battery", value: "Battery" },
                { title: "🚲 Bike", value: "Bike" },
              ],
            }},
            { name: "title", type: "string", title: "Titel" },
            { name: "description", type: "string", title: "Beschreibung" },
          ],
        },
      ],
    }),

    // === FAQ ===
    defineField({
      name: "faqBg",
      title: "FAQ Hintergrund",
      type: "sectionMedia",
      group: "faq",
    }),
    defineField({
      name: "faqHeading",
      title: "FAQ Ueberschrift",
      type: "string",
      group: "faq",
    }),
    defineField({
      name: "faqs",
      title: "Haeufige Fragen",
      type: "array",
      group: "faq",
      of: [
        {
          type: "object",
          fields: [
            { name: "question", type: "string", title: "Frage" },
            { name: "answer", type: "text", title: "Antwort" },
          ],
        },
      ],
    }),

    // === CTA ===
    defineField({
      name: "ctaBg",
      title: "CTA Hintergrund",
      type: "sectionMedia",
      group: "cta",
    }),
    defineField({
      name: "ctaHeading",
      title: "CTA Ueberschrift",
      type: "string",
      group: "cta",
    }),
    defineField({
      name: "ctaSubheading",
      title: "CTA Unterueberschrift",
      type: "text",
      rows: 2,
      group: "cta",
    }),
    defineField({
      name: "ctaPrimaryCta",
      title: "Primaerer CTA",
      type: "cta",
      group: "cta",
    }),
    defineField({
      name: "ctaSecondaryCta",
      title: "Sekundaerer CTA",
      type: "cta",
      group: "cta",
    }),

    // === SEO ===
    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
      group: "seo",
    }),
  ],
  preview: {
    prepare: () => ({ title: "Startseite" }),
  },
})
