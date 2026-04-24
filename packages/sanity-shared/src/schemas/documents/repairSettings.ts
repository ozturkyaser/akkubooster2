import { defineField, defineType } from "sanity"

/**
 * Reparatur-Einstellungen (Singleton)
 * Zentrale Konfiguration für alle Produktseiten:
 * - Gehäuse-Optionen
 * - Problem-Optionen (Symptome)
 * - Dauer-Optionen
 * - Preisregeln
 * - Diagnose-Leistungen
 * - Trust-Badges
 * - Prozess-Schritte
 * - FAQ
 * - Service-Beschreibungen
 */
export const repairSettings = defineType({
  name: "repairSettings",
  title: "Reparatur-Einstellungen",
  type: "document",
  groups: [
    { name: "gehause", title: "Gehäuse-Optionen" },
    { name: "probleme", title: "Probleme / Symptome" },
    { name: "dauer", title: "Dauer-Optionen" },
    { name: "preise", title: "Preisregeln" },
    { name: "diagnose", title: "Diagnose" },
    { name: "reparaturServices", title: "Reparatur-Services" },
    { name: "services", title: "Service-Karten (Übersicht)" },
    { name: "trust", title: "Trust-Badges" },
    { name: "prozess", title: "Prozess-Schritte" },
    { name: "faq", title: "FAQ" },
    { name: "cta", title: "CTA-Bereich" },
    { name: "texte", title: "Allgemeine Texte" },
  ],
  fields: [
    // ── Gehäuse-Optionen ────────────────────────────
    defineField({
      name: "gehauseHeading",
      title: "Gehäuse-Überschrift",
      type: "string",
      initialValue: "Zustand des Akkugehäuses",
      group: "gehause",
    }),
    defineField({
      name: "gehauseSubheading",
      title: "Gehäuse-Untertitel",
      type: "string",
      initialValue: "Ist das Gehäuse deines Akkus äußerlich beschädigt?",
      group: "gehause",
    }),
    defineField({
      name: "gehauseOptions",
      title: "Gehäuse-Optionen",
      type: "array",
      group: "gehause",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "id", title: "ID (intern)", type: "string" }),
            defineField({ name: "label", title: "Label", type: "string" }),
            defineField({
              name: "description",
              title: "Beschreibung",
              type: "string",
            }),
            defineField({
              name: "severity",
              title: "Schweregrad",
              type: "string",
              options: {
                list: [
                  { title: "OK (grün)", value: "ok" },
                  { title: "Warnung (gelb)", value: "warn" },
                  { title: "Gefahr (rot)", value: "danger" },
                  { title: "Kritisch (dunkelrot)", value: "critical" },
                ],
              },
            }),
            defineField({
              name: "warningText",
              title: "Warnhinweis (optional)",
              type: "text",
              rows: 2,
            }),
          ],
          preview: {
            select: { title: "label", subtitle: "severity" },
          },
        },
      ],
    }),

    // ── Problem-Optionen ────────────────────────────
    defineField({
      name: "problemeHeading",
      title: "Problem-Überschrift",
      type: "string",
      initialValue: "Was ist das Problem mit deinem Akku?",
      group: "probleme",
    }),
    defineField({
      name: "problemeSubheading",
      title: "Problem-Untertitel",
      type: "string",
      initialValue: "Welches Problem hast du? (Mehrfachauswahl möglich)",
      group: "probleme",
    }),
    defineField({
      name: "problemeOptions",
      title: "Problem-Optionen",
      type: "array",
      group: "probleme",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "id", title: "ID (intern)", type: "string" }),
            defineField({ name: "label", title: "Label", type: "string" }),
            defineField({
              name: "description",
              title: "Beschreibung (optional)",
              type: "string",
            }),
          ],
          preview: {
            select: { title: "label" },
          },
        },
      ],
    }),
    defineField({
      name: "beschreibungPlaceholder",
      title: "Beschreibungs-Placeholder",
      type: "string",
      initialValue:
        "z.B. Nach 20 Minuten Fahrt geht der Akku einfach aus, obwohl er vorher voll geladen war",
      group: "probleme",
    }),
    defineField({
      name: "beschreibungMinChars",
      title: "Min. Zeichen für Beschreibung",
      type: "number",
      initialValue: 20,
      group: "probleme",
    }),

    // ── Dauer-Optionen ──────────────────────────────
    defineField({
      name: "dauerHeading",
      title: "Dauer-Überschrift",
      type: "string",
      initialValue: "Seit wann besteht das Problem?",
      group: "dauer",
    }),
    defineField({
      name: "dauerOptions",
      title: "Dauer-Optionen",
      type: "array",
      group: "dauer",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "id", title: "ID (intern)", type: "string" }),
            defineField({ name: "label", title: "Label", type: "string" }),
            defineField({
              name: "hinweis",
              title: "KI-Hinweis (wird bei Auswahl angezeigt)",
              type: "text",
              rows: 2,
            }),
          ],
          preview: {
            select: { title: "label" },
          },
        },
      ],
    }),

    // ── Preisregeln ─────────────────────────────────
    defineField({
      name: "preisregeln",
      title: "Preisregeln",
      type: "array",
      group: "preise",
      description:
        "Jede Regel ordnet einem Problem-ID eine Preisspanne zu. Problem-ID muss mit der ID in Problem-Optionen übereinstimmen.",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "problemId",
              title: "Problem-ID",
              type: "string",
              description: "Muss mit einer Problem-Option-ID übereinstimmen",
            }),
            defineField({
              name: "label",
              title: "Preisbezeichnung",
              type: "string",
            }),
            defineField({
              name: "minPreis",
              title: "Min. Preis (€)",
              type: "number",
            }),
            defineField({
              name: "maxPreis",
              title: "Max. Preis (€)",
              type: "number",
            }),
            defineField({
              name: "minPreisUeber60V",
              title: "Min. Preis über 60V (€, optional)",
              type: "number",
            }),
            defineField({
              name: "maxPreisUeber60V",
              title: "Max. Preis über 60V (€, optional)",
              type: "number",
            }),
          ],
          preview: {
            select: {
              title: "label",
              min: "minPreis",
              max: "maxPreis",
            },
            prepare({ title, min, max }) {
              return {
                title: title || "Preisregel",
                subtitle: min === max ? `${min} €` : `${min}–${max} €`,
              }
            },
          },
        },
      ],
    }),

    // ── Sidebar Preisliste ──────────────────────────
    defineField({
      name: "sidebarPreise",
      title: "Sidebar Preisliste",
      type: "array",
      group: "preise",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "label", title: "Label", type: "string" }),
            defineField({ name: "preis", title: "Preis-Text", type: "string" }),
            defineField({
              name: "highlight",
              title: "Hervorheben (grün)",
              type: "boolean",
              initialValue: false,
            }),
          ],
          preview: {
            select: { title: "label", subtitle: "preis" },
          },
        },
      ],
    }),
    defineField({
      name: "sidebarHinweis",
      title: "Sidebar Hinweistext",
      type: "text",
      rows: 2,
      group: "preise",
      initialValue:
        "Zahlung erst nach erfolgreicher Reparatur. Diagnose-Kosten werden bei Reparaturauftrag angerechnet.",
    }),

    // ── Diagnose ────────────────────────────────────
    defineField({
      name: "diagnosePreis",
      title: "Diagnose-Preis (€)",
      type: "number",
      initialValue: 49,
      group: "diagnose",
    }),
    defineField({
      name: "diagnoseLeistungen",
      title: "Diagnose-Leistungen",
      type: "array",
      group: "diagnose",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "diagnoseInfo",
      title: "Diagnose-Info-Text",
      type: "text",
      rows: 3,
      group: "diagnose",
      initialValue:
        "Unsere Techniker analysieren Ihren Akku umfassend und erstellen einen detaillierten Befund mit Reparatur-Empfehlung.",
    }),

    // ── Service-Karten ──────────────────────────────
    defineField({
      name: "serviceCards",
      title: "Service-Karten (Übersicht)",
      type: "array",
      group: "services",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "title", title: "Titel", type: "string" }),
            defineField({
              name: "preisText",
              title: "Preis-Text",
              type: "string",
            }),
            defineField({
              name: "description",
              title: "Beschreibung",
              type: "text",
              rows: 2,
            }),
            defineField({
              name: "color",
              title: "Farbe",
              type: "string",
              options: {
                list: [
                  { title: "Grün", value: "green" },
                  { title: "Gelb", value: "amber" },
                  { title: "Blau", value: "blue" },
                ],
              },
            }),
          ],
          preview: {
            select: { title: "title", subtitle: "preisText" },
          },
        },
      ],
    }),

    // ── Zellentausch Info ────────────────────────────
    defineField({
      name: "zellentauschInfo",
      title: "Zellentausch Info-Banner",
      type: "text",
      rows: 2,
      group: "services",
      initialValue:
        "Wir ersetzen alle Zellen Ihres Akkus mit hochwertigen Markenzellen (Samsung, LG, Panasonic). Wählen Sie die gewünschte Kapazität.",
    }),

    // ── Reparatur-Services (feste Dienstleistungen mit Preisen) ──
    defineField({
      name: "reparaturServicesHeading",
      title: "Reparatur-Services Überschrift",
      type: "string",
      initialValue: "Welche Reparatur benötigen Sie?",
      group: "reparaturServices",
    }),
    defineField({
      name: "reparaturServicesSubheading",
      title: "Reparatur-Services Untertitel",
      type: "string",
      initialValue:
        "Wählen Sie den passenden Service. Alle Preise inkl. Rückversand und 12 Monate Garantie.",
      group: "reparaturServices",
    }),
    defineField({
      name: "reparaturServiceItems",
      title: "Reparatur-Services",
      type: "array",
      group: "reparaturServices",
      description:
        "Definierte Reparatur-Dienstleistungen mit festen Preisen. Diese werden auf allen Produktseiten im Reparatur-Tab angezeigt.",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "id",
              title: "ID (intern)",
              type: "string",
              description: "z.B. bms_austausch, ladebuchse, tiefentladung",
            }),
            defineField({ name: "title", title: "Titel", type: "string" }),
            defineField({
              name: "description",
              title: "Kurzbeschreibung",
              type: "text",
              rows: 2,
            }),
            defineField({
              name: "icon",
              title: "Icon",
              type: "string",
              options: {
                list: [
                  { title: "Zahnrad (BMS)", value: "cog" },
                  { title: "Stecker (Buchse)", value: "plug" },
                  { title: "Blitz (Tiefentladung)", value: "bolt" },
                  { title: "Batterie", value: "battery" },
                  { title: "Werkzeug", value: "wrench" },
                  { title: "Schild", value: "shield" },
                ],
              },
            }),
            defineField({
              name: "preis",
              title: "Preis (€) für ≤60V",
              type: "number",
            }),
            defineField({
              name: "preisUeber60V",
              title: "Preis (€) für >60V (optional, wenn abweichend)",
              type: "number",
            }),
            defineField({
              name: "preisText",
              title: "Preis-Anzeige (überschreibt berechneten Preis)",
              type: "string",
              description:
                'z.B. "ab 120 €" oder "120–150 €". Wenn leer, wird der Preis automatisch angezeigt.',
            }),
            defineField({
              name: "leistungen",
              title: "Inkludierte Leistungen",
              type: "array",
              of: [{ type: "string" }],
            }),
            defineField({
              name: "hinweis",
              title: "Zusätzlicher Hinweis (optional)",
              type: "text",
              rows: 2,
            }),
            defineField({
              name: "highlight",
              title: "Hervorheben (beliebtester Service)",
              type: "boolean",
              initialValue: false,
            }),
          ],
          preview: {
            select: { title: "title", preis: "preis", preisText: "preisText" },
            prepare({ title, preis, preisText }) {
              return {
                title: title || "Service",
                subtitle: preisText || (preis ? `${preis} €` : ""),
              }
            },
          },
        },
      ],
    }),

    // ── Trust-Badges ────────────────────────────────
    defineField({
      name: "trustBadges",
      title: "Trust-Badges",
      type: "array",
      group: "trust",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "icon",
              title: "Icon",
              type: "string",
              options: {
                list: [
                  { title: "Schild", value: "shield" },
                  { title: "LKW", value: "truck" },
                  { title: "Uhr", value: "clock" },
                  { title: "Haken", value: "check" },
                ],
              },
            }),
            defineField({ name: "title", title: "Titel", type: "string" }),
            defineField({
              name: "description",
              title: "Beschreibung",
              type: "string",
            }),
          ],
          preview: {
            select: { title: "title", subtitle: "description" },
          },
        },
      ],
    }),

    // ── Prozess-Schritte ────────────────────────────
    defineField({
      name: "processHeading",
      title: "Prozess-Überschrift",
      type: "string",
      initialValue: "So funktioniert es",
      group: "prozess",
    }),
    defineField({
      name: "processSteps",
      title: "Prozess-Schritte",
      type: "array",
      group: "prozess",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "title", title: "Titel", type: "string" }),
            defineField({
              name: "description",
              title: "Beschreibung",
              type: "string",
            }),
          ],
          preview: {
            select: { title: "title", subtitle: "description" },
          },
        },
      ],
    }),

    // ── FAQ ──────────────────────────────────────────
    defineField({
      name: "faqHeading",
      title: "FAQ-Überschrift",
      type: "string",
      initialValue: "Häufige Fragen",
      group: "faq",
    }),
    defineField({
      name: "faqItems",
      title: "FAQ-Einträge",
      type: "array",
      group: "faq",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "question",
              title: "Frage",
              type: "string",
            }),
            defineField({ name: "answer", title: "Antwort", type: "text" }),
          ],
          preview: {
            select: { title: "question" },
          },
        },
      ],
    }),

    // ── CTA ─────────────────────────────────────────
    defineField({
      name: "ctaHeading",
      title: "CTA-Überschrift",
      type: "string",
      initialValue: "Bereit für einen Akku wie neu?",
      group: "cta",
    }),
    defineField({
      name: "ctaSubheading",
      title: "CTA-Untertitel",
      type: "string",
      initialValue:
        "Professioneller Service mit 12 Monaten Garantie. Kostenloser Rückversand. Zahlung nach Reparatur.",
      group: "cta",
    }),
    defineField({
      name: "ctaPrimaryLabel",
      title: "CTA Primär Label",
      type: "string",
      initialValue: "Jetzt Service wählen ↑",
      group: "cta",
    }),
    defineField({
      name: "ctaSecondaryLabel",
      title: "CTA Sekundär Label",
      type: "string",
      initialValue: "Kostenloser Akku-Check →",
      group: "cta",
    }),
    defineField({
      name: "ctaSecondaryHref",
      title: "CTA Sekundär Link",
      type: "string",
      initialValue: "/ki-check",
      group: "cta",
    }),

    // ── Allgemeine Texte ────────────────────────────
    defineField({
      name: "garantieTitle",
      title: "Garantie-Box Titel",
      type: "string",
      initialValue: "Reparatur-Garantie",
      group: "texte",
    }),
    defineField({
      name: "garantieText",
      title: "Garantie-Box Text",
      type: "text",
      rows: 3,
      initialValue:
        "Keine Vorauszahlung nötig. Sie zahlen erst nach erfolgreicher Reparatur. 12 Monate Garantie auf alle Zellen und unsere Arbeit.",
      group: "texte",
    }),
    defineField({
      name: "nichtReparierbarHeading",
      title: "Nicht-reparierbar Überschrift",
      type: "string",
      initialValue: "Wann ist keine Reparatur möglich?",
      group: "texte",
    }),
    defineField({
      name: "nichtReparierbarItems",
      title: "Nicht-reparierbar Gründe",
      type: "array",
      group: "texte",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "symptomTags",
      title: "Symptom-Tags (Anzeige auf Produktseite)",
      type: "array",
      group: "texte",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "kiAnalyseDisclaimer",
      title: "KI-Analyse Disclaimer",
      type: "text",
      rows: 2,
      initialValue:
        "Automatische Vorab-Einschätzung. Der endgültige Preis wird nach Diagnose in unserer Werkstatt festgelegt. Keine Kosten ohne Ihre Zustimmung.",
      group: "texte",
    }),
  ],
  preview: {
    prepare() {
      return { title: "Reparatur-Einstellungen" }
    },
  },
})
