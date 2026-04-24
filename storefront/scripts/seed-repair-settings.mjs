/**
 * Seed-Script: Füllt das repairSettings-Dokument in Sanity mit Standardwerten.
 * Ausführen: node storefront/scripts/seed-repair-settings.mjs
 */
import { createClient } from "@sanity/client"

const client = createClient({
  projectId: "ep5dzepn",
  dataset: "production",
  apiVersion: "2026-04-01",
  useCdn: false,
  token: process.env.SANITY_API_READ_TOKEN,
})

const doc = {
  _id: "repairSettings",
  _type: "repairSettings",

  // ── Gehäuse-Optionen ────────────────────────
  gehauseHeading: "Zustand des Akkugehäuses",
  gehauseSubheading: "Ist das Gehäuse deines Akkus äußerlich beschädigt?",
  gehauseOptions: [
    {
      _key: "g1",
      id: "ok",
      label: "Nein, Gehäuse ist in Ordnung",
      description: "Keine sichtbaren Risse, Dellen oder Verformungen",
      severity: "ok",
    },
    {
      _key: "g2",
      id: "kratzer",
      label: "Leichte Kratzer / Gebrauchsspuren",
      description: "Optische Mängel, aber Gehäuse intakt",
      severity: "warn",
    },
    {
      _key: "g3",
      id: "gerissen",
      label: "Ja, Gehäuse ist gerissen / verformt",
      description: "Sichtbare Risse, Dellen, Gehäuse steht ab",
      severity: "danger",
      warningText:
        "Bei einem beschädigten Gehäuse können zusätzliche Kosten für ein Ersatzgehäuse anfallen (falls verfügbar).",
    },
    {
      _key: "g4",
      id: "aufgeblaht",
      label: "Ja, Gehäuse ist aufgebläht",
      description: "Akku ist sichtbar dicker geworden",
      severity: "critical",
      warningText:
        "Ein aufgeblähter Akku ist ein Sicherheitsrisiko. Bitte laden Sie den Akku nicht weiter und bewahren Sie ihn an einem kühlen, trockenen Ort auf. Wir empfehlen einen Zellentausch.",
    },
  ],

  // ── Probleme / Symptome ─────────────────────
  problemeHeading: "Was ist das Problem mit deinem Akku?",
  problemeSubheading: "Welches Problem hast du? (Mehrfachauswahl möglich)",
  problemeOptions: [
    { _key: "p1", id: "laedt_nicht", label: "Akku lädt nicht mehr", description: "Ladegerät zeigt keine Reaktion oder Akku bleibt leer" },
    { _key: "p2", id: "reichweite", label: "Reichweite stark reduziert", description: "Akku hält deutlich kürzer als früher" },
    { _key: "p3", id: "abschalten", label: "Akku schaltet sich plötzlich ab", description: "Mitten in der Fahrt geht der Akku einfach aus" },
    { _key: "p4", id: "fehlermeldung", label: "Fehlermeldung am Display", description: "Das E-Bike zeigt einen Fehlercode an" },
    { _key: "p5", id: "nicht_erkannt", label: "Akku wird vom E-Bike nicht erkannt", description: "E-Bike reagiert nicht auf den eingesetzten Akku" },
    { _key: "p6", id: "led_blinkt", label: "LED blinkt rot / ungewöhnlich", description: "Die Statusanzeige am Akku zeigt Fehler" },
    { _key: "p7", id: "heiss", label: "Akku wird sehr heiß", description: "Ungewöhnliche Wärmeentwicklung beim Laden oder Fahren" },
    { _key: "p8", id: "laden_bricht_ab", label: "Ladevorgang bricht ab", description: "Laden startet, stoppt aber vorzeitig" },
    { _key: "p9", id: "sonstiges", label: "Sonstiges", description: "Anderes Problem, bitte unten beschreiben" },
  ],
  beschreibungPlaceholder:
    "z.B. Nach 20 Minuten Fahrt geht der Akku einfach aus, obwohl er vorher voll geladen war",
  beschreibungMinChars: 20,

  // ── Dauer-Optionen ──────────────────────────
  dauerHeading: "Seit wann besteht das Problem?",
  dauerOptions: [
    { _key: "d1", id: "tage", label: "Seit ein paar Tagen", hinweis: "Ein plötzliches Problem deutet oft auf einen konkreten Defekt hin, der gut reparierbar ist." },
    { _key: "d2", id: "wochen", label: "Seit ein paar Wochen", hinweis: "Probleme seit einigen Wochen können auf fortschreitende Zellschäden hindeuten." },
    { _key: "d3", id: "monate", label: "Seit ein paar Monaten", hinweis: "Bei länger bestehenden Problemen empfehlen wir eine umfassende Diagnose." },
    { _key: "d4", id: "schleichend", label: "Schleichend über längere Zeit", hinweis: "Schleichende Probleme deuten oft auf natürliche Zellalterung hin. Ein Zellentausch könnte langfristig sinnvoller sein als eine Reparatur." },
    { _key: "d5", id: "ereignis", label: "Nach einem bestimmten Ereignis (Sturz, Wasserschaden, etc.)", hinweis: "Bei Sturzschäden oder Wasserschäden ist eine genaue Diagnose besonders wichtig. Unsere Techniker prüfen alle Komponenten sorgfältig." },
  ],

  // ── Preisregeln ─────────────────────────────
  preisregeln: [
    { _key: "pr1", problemId: "laedt_nicht", label: "Lade-Problem (Diagnose + Reparatur)", minPreis: 80, maxPreis: 150, minPreisUeber60V: 120, maxPreisUeber60V: 200 },
    { _key: "pr2", problemId: "laden_bricht_ab", label: "Lade-Problem (Diagnose + Reparatur)", minPreis: 80, maxPreis: 150, minPreisUeber60V: 120, maxPreisUeber60V: 200 },
    { _key: "pr3", problemId: "reichweite", label: "Kapazitätsverlust → Zellentausch empfohlen", minPreis: 200, maxPreis: 450 },
    { _key: "pr4", problemId: "abschalten", label: "BMS / Ausbalancierung", minPreis: 120, maxPreis: 150, minPreisUeber60V: 150, maxPreisUeber60V: 200 },
    { _key: "pr5", problemId: "fehlermeldung", label: "Elektronik-/BMS-Fehler", minPreis: 120, maxPreis: 120, minPreisUeber60V: 150, maxPreisUeber60V: 200 },
    { _key: "pr6", problemId: "led_blinkt", label: "Elektronik-/BMS-Fehler", minPreis: 120, maxPreis: 120, minPreisUeber60V: 150, maxPreisUeber60V: 200 },
    { _key: "pr7", problemId: "nicht_erkannt", label: "Kommunikations-/BMS-Problem", minPreis: 120, maxPreis: 150 },
    { _key: "pr8", problemId: "heiss", label: "Überhitzung (Sicherheitscheck + Reparatur)", minPreis: 150, maxPreis: 300 },
    { _key: "pr9", problemId: "sonstiges", label: "Diagnose-Pauschale (wird bei Reparatur angerechnet)", minPreis: 49, maxPreis: 49 },
  ],

  // ── Sidebar Preisliste ──────────────────────
  sidebarPreise: [
    { _key: "sp1", label: "BMS-Reparatur (≤60V)", preis: "120 €" },
    { _key: "sp2", label: "Tiefentladung", preis: "150 €" },
    { _key: "sp3", label: "Ausbalancieren", preis: "150 €" },
    { _key: "sp4", label: "Ladebuchse", preis: "89 €" },
    { _key: "sp5", label: "Diagnose", preis: "49 €" },
    { _key: "sp6", label: "Rückversand", preis: "Kostenlos", highlight: true },
  ],
  sidebarHinweis:
    "Zahlung erst nach erfolgreicher Reparatur. Diagnose-Kosten werden bei Reparaturauftrag angerechnet.",

  // ── Diagnose ────────────────────────────────
  diagnosePreis: 49,
  diagnoseLeistungen: [
    "Vollständige Spannungsprüfung aller Zellen",
    "BMS-Funktionstest (Batterie-Management-System)",
    "Lade- und Entladetest mit Messprotokoll",
    "Visuelle Inspektion auf Beschädigungen",
    "Schriftlicher Befund mit Fotos",
    "Reparatur-Empfehlung mit genauer Preisangabe",
  ],
  diagnoseInfo:
    "Unsere Techniker analysieren Ihren Akku umfassend und erstellen einen detaillierten Befund mit Reparatur-Empfehlung.",

  // ── Reparatur-Services ──────────────────────
  reparaturServicesHeading: "Welche Reparatur benötigen Sie?",
  reparaturServicesSubheading:
    "Wählen Sie den passenden Service. Alle Preise inkl. Rückversand und 12 Monate Garantie.",
  reparaturServiceItems: [
    {
      _key: "rs1",
      id: "bms_austausch",
      title: "BMS-Austausch",
      description:
        "Austausch des Batterie-Management-Systems (BMS). Behebt Fehlermeldungen, Abschaltungen und Kommunikationsprobleme zwischen Akku und E-Bike.",
      icon: "cog",
      preis: 120,
      preisUeber60V: 150,
      leistungen: [
        "BMS-Diagnose & Fehleranalyse",
        "Austausch mit kompatiblem BMS",
        "Zell-Balancing nach Einbau",
        "Funktionstest & Testprotokoll",
      ],
      highlight: true,
    },
    {
      _key: "rs2",
      id: "ladebuchse",
      title: "Ladebuchse / Anschlussbuchse",
      description:
        "Austausch defekter Lade- oder Anschlussbuchsen. Löst Probleme beim Laden oder der Verbindung zum E-Bike.",
      icon: "plug",
      preis: 89,
      leistungen: [
        "Buchsen-Diagnose",
        "Austausch der defekten Buchse",
        "Lötarbeiten & Abdichtung",
        "Lade- und Verbindungstest",
      ],
    },
    {
      _key: "rs3",
      id: "tiefentladung",
      title: "Tiefentladung beheben",
      description:
        "Wiederbelebung tiefentladener Akkuzellen. Der Akku wird schonend wieder auf Betriebsspannung gebracht und ausbalanciert.",
      icon: "bolt",
      preis: 150,
      leistungen: [
        "Zellspannungsprüfung",
        "Schonende Wiederaufladung",
        "Zell-Balancing",
        "Kapazitätstest nach Behandlung",
      ],
    },
    {
      _key: "rs4",
      id: "ausbalancierung",
      title: "Zell-Ausbalancierung",
      description:
        "Ausgleich der Zellspannungen für gleichmäßige Leistung. Behebt ungleichmäßige Entladung und verlängert die Lebensdauer.",
      icon: "battery",
      preis: 150,
      leistungen: [
        "Einzelzellmessung",
        "Aktives Zell-Balancing",
        "Kapazitätstest vorher/nachher",
        "Detailliertes Messprotokoll",
      ],
    },
  ],

  // ── Service-Karten (Übersicht) ──────────────
  serviceCards: [
    { _key: "sc1", title: "Zellentausch", preisText: "ab 199 €", description: "Alle Zellen werden durch neue Markenzellen ersetzt. Volle Kapazität & maximale Reichweite.", color: "green" },
    { _key: "sc2", title: "Reparatur", preisText: "ab 89 €", description: "BMS-Austausch, Ladebuchse, Tiefentladung. Feste Preise je nach Service.", color: "amber" },
    { _key: "sc3", title: "Diagnose", preisText: "49 €", description: "Umfassende Analyse mit Testprotokoll. Wird bei Reparatur angerechnet.", color: "blue" },
  ],
  zellentauschInfo:
    "Wir ersetzen alle Zellen Ihres Akkus mit hochwertigen Markenzellen (Samsung, LG, Panasonic). Wählen Sie die gewünschte Kapazität.",

  // ── Trust-Badges ────────────────────────────
  trustBadges: [
    { _key: "tb1", icon: "shield", title: "12 Monate Garantie", description: "Auf alle Zellen & Arbeit" },
    { _key: "tb2", icon: "truck", title: "Kostenloser Rückversand", description: "Versicherter Versand" },
    { _key: "tb3", icon: "clock", title: "Zahlung nach Reparatur", description: "Kein Risiko für Sie" },
    { _key: "tb4", icon: "check", title: "Zertifizierte Reparatur", description: "Hochwertige Markenzellen" },
  ],

  // ── Prozess-Schritte ────────────────────────
  processHeading: "So funktioniert es",
  processSteps: [
    { _key: "ps1", title: "Service wählen", description: "Zellentausch, Reparatur oder Diagnose" },
    { _key: "ps2", title: "Akku einsenden", description: "Kostenlos & versichert an uns senden" },
    { _key: "ps3", title: "Professionelle Arbeit", description: "Diagnose, Reparatur oder Zellentausch" },
    { _key: "ps4", title: "Akku zurück", description: "Reparierter Akku, wie neu!" },
  ],

  // ── FAQ ─────────────────────────────────────
  faqHeading: "Häufige Fragen",
  faqItems: [
    { _key: "f1", question: "Lohnt sich eine Reparatur im Vergleich zum Neukauf?", answer: "In den meisten Fällen ja! Ein Zellentausch kostet in der Regel 30–60 % weniger als ein neuer Originalakku. Dazu kommt: Ihr Gehäuse bleibt erhalten, alles passt perfekt und Sie schonen die Umwelt." },
    { _key: "f2", question: "Wie lange dauert die Reparatur?", answer: "In der Regel 3–5 Werktage nach Eingang Ihres Akkus in unserer Werkstatt. Inklusive umfassender Tests und Qualitätskontrolle. Der Rückversand ist versichert und kostenlos." },
    { _key: "f3", question: "Welche Garantie erhalte ich?", answer: "Sie erhalten 12 Monate Garantie auf alle von uns verbauten Zellen und die durchgeführte Arbeit. Sollte in dieser Zeit ein Problem auftreten, reparieren wir kostenlos nach." },
    { _key: "f4", question: "Kann ich die Reparatur selbst durchführen?", answer: "Davon raten wir dringend ab. E-Bike Akkus arbeiten mit hohen Spannungen und Strömen. Ein unsachgemäßer Zellentausch kann zu Kurzschlüssen, Bränden oder Verletzungen führen. Überlassen Sie das den Profis!" },
    { _key: "f5", question: "Was passiert, wenn mein Akku nicht reparierbar ist?", answer: "Wir prüfen jeden Akku sorgfältig. Sollte eine Reparatur nicht möglich sein (z.B. bei schweren Gehäuseschäden), informieren wir Sie und senden den Akku kostenlos zurück. Kosten entstehen nur bei erfolgreicher Reparatur." },
    { _key: "f6", question: "Welche Zellen werden verwendet?", answer: "Wir verwenden ausschließlich hochwertige Markenzellen von Samsung, LG oder Panasonic. Diese Zellen bieten höchste Zyklenfestigkeit, maximale Kapazität und optimale Sicherheit." },
  ],

  // ── CTA ─────────────────────────────────────
  ctaHeading: "Bereit für einen Akku wie neu?",
  ctaSubheading:
    "Professioneller Service mit 12 Monaten Garantie. Kostenloser Rückversand. Zahlung nach Reparatur.",
  ctaPrimaryLabel: "Jetzt Service wählen ↑",
  ctaSecondaryLabel: "Kostenloser Akku-Check →",
  ctaSecondaryHref: "/ki-check",

  // ── Allgemeine Texte ────────────────────────
  garantieTitle: "Reparatur-Garantie",
  garantieText:
    "Keine Vorauszahlung nötig. Sie zahlen erst nach erfolgreicher Reparatur. 12 Monate Garantie auf alle Zellen und unsere Arbeit.",
  nichtReparierbarHeading: "Wann ist keine Reparatur möglich?",
  nichtReparierbarItems: [
    "Schwere Gehäuseschäden (stark verformt oder gebrochen)",
    "Brand- oder Feuerschäden",
    "Aufgeblähte Zellen (Zellentausch empfohlen)",
    "Nicht verfügbare Zelltypen oder BMS-Teile",
  ],
  symptomTags: [
    "Akku lädt nicht mehr",
    "Geringe Reichweite",
    "Plötzliches Abschalten",
    "Lange Ladezeit",
    "Display-Fehlermeldung",
    "Akku wird heiß",
    "Kapazitätsverlust",
    "Lässt sich nicht einschalten",
  ],
  kiAnalyseDisclaimer:
    "Automatische Vorab-Einschätzung. Der endgültige Preis wird nach Diagnose in unserer Werkstatt festgelegt. Keine Kosten ohne Ihre Zustimmung.",
}

async function main() {
  console.log("Seeding repairSettings in Sanity...")

  try {
    const result = await client.createOrReplace(doc)
    console.log(`✅ repairSettings erfolgreich erstellt/aktualisiert: ${result._id}`)
    console.log(`\nÖffne http://localhost:3333 → Einstellungen → Reparatur-Einstellungen um die Daten zu sehen.`)
  } catch (err) {
    console.error("❌ Fehler:", err.message || err)
    if (err.message?.includes("Insufficient permissions")) {
      console.log("\n💡 Der Token hat keine Schreibrechte. Versuche es mit dem Sanity CLI...")
      console.log("   Alternativ: Öffne Sanity Studio und fülle die Felder manuell aus.")
    }
  }
}

main()
