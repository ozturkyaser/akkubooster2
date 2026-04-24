/**
 * Sanity Content Seed Script
 *
 * Uebertraegt alle hardcoded deutschen Texte aus dem Storefront in Sanity.
 * Ausfuehren: npx ts-node seed-content.ts
 *
 * Vorher: SANITY_PROJECT_ID und SANITY_AUTH_TOKEN als Env-Variablen setzen
 */
import { createClient } from "@sanity/client"

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID!,
  dataset: "production",
  apiVersion: "2026-04-01",
  token: process.env.SANITY_AUTH_TOKEN!, // Write-Token aus sanity.io/manage
  useCdn: false,
})

async function seed() {
  console.log("Seeding Sanity Content...")

  // ========== STARTSEITE ==========
  await client.createOrReplace({
    _id: "homePage",
    _type: "homePage",
    heroBadge: "Berlins #1 Akku-Werkstatt",
    heroHeadline: "Dein E-Bike Akku verdient ein",
    heroHeadlineHighlight: "zweites Leben",
    heroSubline:
      "Professionelle Akku-Reparatur, Zellentausch und Diagnose fuer E-Bikes, E-Scooter und mehr. Schnell, nachhaltig, fair.",
    heroPrimaryCta: { _type: "cta", label: "Kostenloser KI-Check", href: "/ki-check", variant: "primary" },
    heroSecondaryCta: { _type: "cta", label: "Reparatur-Service", href: "/reparatur", variant: "secondary" },
    stats: [
      { _key: "s1", value: "2.500+", label: "Akkus repariert" },
      { _key: "s2", value: "110+", label: "Marken" },
      { _key: "s3", value: "4.9/5", label: "Google-Bewertung" },
      { _key: "s4", value: "48h", label: "Durchschn. Reparatur" },
    ],
    servicesHeading: "Unsere Services",
    servicesSubheading:
      "Von der Diagnose bis zum Zellentausch — alles aus einer Hand in unserer Berliner Werkstatt.",
    services: [
      {
        _key: "sv1",
        icon: "battery",
        title: "Zellentausch",
        description:
          "Wir ersetzen defekte Zellen durch hochwertige Markenzellen. Dein Akku wird wie neu.",
        href: "/reparatur",
        badge: "Bestseller",
        highlight: true,
      },
      {
        _key: "sv2",
        icon: "cpu",
        title: "KI-Diagnose",
        description:
          "Lade ein Foto hoch — unsere KI erkennt Marke, Modell und Schaeden in 60 Sekunden.",
        href: "/ki-check",
        badge: "Kostenlos",
        highlight: false,
      },
      {
        _key: "sv3",
        icon: "zap",
        title: "Kapazitaets-Boost",
        description:
          "Mehr Reichweite durch Upgrade auf leistungsstaerkere Zellen. Bis zu 40% mehr Kapazitaet.",
        href: "/reparatur",
        highlight: false,
      },
      {
        _key: "sv4",
        icon: "package",
        title: "Ersatzakku",
        description:
          "Dein Akku ist nicht mehr zu retten? Wir finden den passenden Ersatz fuer dein Modell.",
        href: "/ersatzakku",
        highlight: false,
      },
    ],
    processHeading: "So einfach geht's",
    processSubheading: "In 4 Schritten zum reparierten Akku",
    processSteps: [
      { _key: "p1", number: "1", title: "Anfrage", description: "Online-Formular oder KI-Check — kostenlos und unverbindlich." },
      { _key: "p2", number: "2", title: "Einsenden", description: "Akku sicher verpacken und an unsere Werkstatt senden." },
      { _key: "p3", number: "3", title: "Reparatur", description: "Diagnose + Reparatur in 24-72h. Du wirst ueber jeden Schritt informiert." },
      { _key: "p4", number: "4", title: "Zurueck", description: "Dein Akku kommt wie neu zurueck. Mit Garantie." },
    ],
    brandsHeading: "110+ unterstuetzte Marken",
    brandsSubheading: "Wir reparieren Akkus aller gaengigen E-Bike und E-Scooter Marken.",
    symptomsHeading: "Typische Akku-Probleme",
    symptomsSubheading:
      "Erkennst du eines dieser Symptome? Dann kann AkkuBooster helfen.",
    trustHeading: "Warum AkkuBooster?",
    trustItems: [
      { _key: "t1", icon: "shield", title: "12 Monate Garantie", description: "Auf jede Reparatur und jeden Zellentausch." },
      { _key: "t2", icon: "leaf", title: "Nachhaltig", description: "Reparieren statt wegwerfen — gut fuer die Umwelt." },
      { _key: "t3", icon: "euro", title: "Faire Preise", description: "Bis zu 60% guenstiger als ein Neuakku." },
      { _key: "t4", icon: "truck", title: "Kostenloser Versand", description: "Hin- und Rueckversand innerhalb Deutschlands." },
      { _key: "t5", icon: "clock", title: "Schnell", description: "Die meisten Reparaturen in 24-72 Stunden." },
      { _key: "t6", icon: "map-pin", title: "Made in Berlin", description: "Lokale Werkstatt mit persoenlichem Service." },
    ],
    faqHeading: "Haeufige Fragen",
    faqs: [
      { _key: "f1", question: "Was kostet eine Akku-Reparatur?", answer: "Die Kosten haengen vom Akku-Typ und Schadensumfang ab. Ein Zellentausch kostet ab 249 EUR. Nach der kostenlosen Diagnose erhaeltst du einen verbindlichen Kostenvoranschlag." },
      { _key: "f2", question: "Wie lange dauert die Reparatur?", answer: "Die meisten Reparaturen sind in 24-72 Stunden erledigt. Bei seltenen Zelltypen kann es bis zu 5 Werktage dauern." },
      { _key: "f3", question: "Welche Marken repariert ihr?", answer: "Wir reparieren Akkus von ueber 110 Marken, darunter Bosch, Shimano, Yamaha, Brose, Specialized und viele mehr." },
      { _key: "f4", question: "Gibt es eine Garantie?", answer: "Ja, auf jede Reparatur geben wir 12 Monate Garantie. Bei Zellentausch gelten die Herstellergarantien der verbauten Markenzellen." },
      { _key: "f5", question: "Wie versende ich meinen Akku?", answer: "Wir senden dir nach Auftragsbestaetigung ein vorfrankiertes Versandlabel zu. Akku sicher verpacken, Label aufkleben, abgeben." },
      { _key: "f6", question: "Ist der KI-Check wirklich kostenlos?", answer: "Ja, der KI-Check ist voellig kostenlos und unverbindlich. Du erhaeltst sofort eine Einschaetzung zu Zustand, Marke und empfohlenen Services." },
    ],
    ctaHeading: "Bereit fuer ein Akku-Upgrade?",
    ctaSubheading: "Starte jetzt mit dem kostenlosen KI-Check oder kontaktiere uns direkt.",
    ctaPrimaryCta: { _type: "cta", label: "Kostenlosen KI-Check starten", href: "/ki-check", variant: "primary" },
    ctaSecondaryCta: { _type: "cta", label: "Kontakt aufnehmen", href: "/kontakt", variant: "secondary" },
    seo: {
      _type: "seo",
      title: "AkkuBooster — E-Bike Akku Reparatur Berlin | Zellentausch & Diagnose",
      description:
        "Professionelle E-Bike Akku Reparatur in Berlin. Zellentausch, KI-Diagnose, 110+ Marken. 12 Monate Garantie. Kostenloser Versand.",
    },
  })
  console.log("  ✓ Startseite")

  // ========== REPARATUR ==========
  await client.createOrReplace({
    _id: "reparaturPage",
    _type: "reparaturPage",
    heading: "Akku-Reparatur Service",
    subheading: "Professionelle Reparatur fuer alle E-Bike und E-Scooter Akkus. Festpreise, 12 Monate Garantie.",
    services: [
      {
        _key: "r1",
        icon: "🔋",
        title: "Zellentausch",
        price: "ab 249 EUR",
        description: "Defekte Zellen werden durch hochwertige Markenzellen ersetzt.",
        features: ["Alle gaengigen Zellformate", "Samsung/LG/Sony Markenzellen", "12 Monate Garantie", "Kapazitaetstest inkl."],
        highlight: true,
      },
      {
        _key: "r2",
        icon: "🔍",
        title: "Professionelle Diagnose",
        price: "49 EUR",
        description: "Umfassende Analyse aller Zellen, BMS und Elektronik.",
        features: ["Einzelzell-Messung", "BMS-Check", "Kapazitaetstest", "Detaillierter Bericht"],
        highlight: false,
      },
      {
        _key: "r3",
        icon: "⚡",
        title: "Kapazitaets-Boost",
        price: "ab 349 EUR",
        description: "Upgrade auf leistungsstaerkere Zellen fuer mehr Reichweite.",
        features: ["Bis zu 40% mehr Kapazitaet", "Hochleistungszellen", "Angepasstes BMS", "Vorher/Nachher-Test"],
        highlight: false,
      },
      {
        _key: "r4",
        icon: "⚖️",
        title: "Zell-Balancing",
        price: "ab 89 EUR",
        description: "Ausgleich unterschiedlich geladener Zellen fuer optimale Leistung.",
        features: ["Einzelzell-Balancing", "Kapazitaetsangleichung", "BMS-Reset", "Ladetest"],
        highlight: false,
      },
    ],
    ctaHeading: "Nicht sicher welchen Service du brauchst?",
    ctaText: "Starte mit unserem kostenlosen KI-Check — er analysiert deinen Akku in 60 Sekunden.",
    ctaPrimary: { _type: "cta", label: "Kostenloser KI-Check", href: "/ki-check", variant: "primary" },
    seo: {
      _type: "seo",
      title: "Akku-Reparatur Service | AkkuBooster Berlin",
      description: "E-Bike Akku Reparatur: Zellentausch ab 249 EUR, Diagnose, Balancing. 110+ Marken. 12 Monate Garantie.",
    },
  })
  console.log("  ✓ Reparatur")

  // ========== KONTAKT ==========
  await client.createOrReplace({
    _id: "kontaktPage",
    _type: "kontaktPage",
    heading: "Kontakt",
    subheading: "Wir sind fuer dich da — per Telefon, E-Mail oder vor Ort in Berlin.",
    phone: "+49 30 12345678",
    email: "info@akkubooster.de",
    address: "AkkuBooster GmbH\nMusterstrasse 42\n10115 Berlin",
    openingHours: [
      { _key: "h1", day: "Mo-Fr", time: "9:00 - 18:00" },
      { _key: "h2", day: "Sa", time: "10:00 - 14:00" },
      { _key: "h3", day: "So", time: "Geschlossen" },
    ],
    noteText: "Fuer Abholung/Abgabe bitte vorher telefonisch einen Termin vereinbaren.",
    quickHelp: [
      { _key: "q1", emoji: "🔋", title: "Akku-Problem?", description: "Starte den kostenlosen KI-Check", href: "/ki-check" },
      { _key: "q2", emoji: "🔧", title: "Reparatur-Auftrag", description: "Direkt Service beauftragen", href: "/reparatur" },
      { _key: "q3", emoji: "❓", title: "Haeufige Fragen", description: "Antworten auf gaengige Fragen", href: "/faq" },
    ],
    seo: {
      _type: "seo",
      title: "Kontakt | AkkuBooster Berlin",
      description: "Kontaktiere AkkuBooster: Telefon, E-Mail oder vor Ort in Berlin. Mo-Fr 9-18 Uhr.",
    },
  })
  console.log("  ✓ Kontakt")

  // ========== WERKSTATT ==========
  await client.createOrReplace({
    _id: "werkstattPage",
    _type: "werkstattPage",
    heading: "Unsere Werkstatt in Berlin",
    subheading: "Besuche uns vor Ort — persoenliche Beratung und Express-Reparatur moeglich.",
    address: "AkkuBooster GmbH\nMusterstrasse 42\n10115 Berlin",
    phone: "+49 30 12345678",
    email: "werkstatt@akkubooster.de",
    openingHours: [
      { _key: "h1", day: "Mo-Fr", time: "9:00 - 18:00" },
      { _key: "h2", day: "Sa", time: "10:00 - 14:00" },
    ],
    features: [
      { _key: "f1", icon: "🔧", title: "Professionelle Ausstattung", description: "Modernste Mess- und Loettechnik fuer praezise Akkureparaturen." },
      { _key: "f2", icon: "⚡", title: "Express-Service", description: "Viele Reparaturen koennen am selben Tag erledigt werden." },
      { _key: "f3", icon: "🤝", title: "Persoenliche Beratung", description: "Wir erklaeren dir genau, was dein Akku braucht." },
    ],
    seo: {
      _type: "seo",
      title: "Werkstatt Berlin | AkkuBooster",
      description: "Besuche unsere Akku-Werkstatt in Berlin. Persoenliche Beratung, Express-Reparatur, Walk-in moeglich.",
    },
  })
  console.log("  ✓ Werkstatt")

  // ========== B2B ==========
  await client.createOrReplace({
    _id: "b2bPage",
    _type: "b2bPage",
    heading: "B2B Akku-Service",
    subheading: "Zuverlaessiger Partner fuer Haendler, Werkstaetten und Flottenbetreiber.",
    benefits: [
      { _key: "b1", icon: "📦", title: "Mengenrabatte", description: "Attraktive Staffelpreise ab 10 Akkus/Monat." },
      { _key: "b2", icon: "🚚", title: "Abholservice", description: "Wir holen Akkus direkt bei dir ab und liefern repariert zurueck." },
      { _key: "b3", icon: "📊", title: "Reporting", description: "Monatliche Reports ueber reparierte Akkus, Kosten und Zustand." },
      { _key: "b4", icon: "🤝", title: "Dedizierter Ansprechpartner", description: "Fester Kontakt fuer alle Anliegen." },
    ],
    ctaHeading: "Interesse an einer Partnerschaft?",
    ctaText: "Kontaktiere uns fuer ein unverbindliches Angebot.",
    contactEmail: "b2b@akkubooster.de",
    seo: {
      _type: "seo",
      title: "B2B Akku-Service | AkkuBooster",
      description: "B2B Akku-Reparatur fuer Haendler und Flottenbetreiber. Mengenrabatte, Abholservice, Reporting.",
    },
  })
  console.log("  ✓ B2B")

  // ========== UEBER UNS ==========
  await client.createOrReplace({
    _id: "ueberUnsPage",
    _type: "ueberUnsPage",
    heading: "Ueber AkkuBooster",
    introText: "Wir sind ein Team von Akku-Spezialisten in Berlin. Unsere Mission: E-Mobilitaet nachhaltiger machen, indem wir Akkus reparieren statt wegwerfen.",
    missionHeading: "Unsere Mission",
    missionText: "Jedes Jahr werden tausende funktionsfaehige E-Bike Akkus entsorgt, weil einzelne Zellen defekt sind. Wir aendern das. Durch professionellen Zellentausch geben wir Akkus ein zweites Leben — gut fuer den Geldbeutel und die Umwelt.",
    stats: [
      { _key: "s1", value: "2.500+", label: "Reparierte Akkus" },
      { _key: "s2", value: "2019", label: "Gegruendet" },
      { _key: "s3", value: "110+", label: "Unterstuetzte Marken" },
      { _key: "s4", value: "12", label: "Monate Garantie" },
    ],
    standortHeading: "Standort Berlin",
    standortText: "Unsere Werkstatt befindet sich in Berlin und ist fuer Kunden aus ganz Deutschland erreichbar — per Versand oder vor Ort.",
    seo: {
      _type: "seo",
      title: "Ueber uns | AkkuBooster Berlin",
      description: "Lerne das AkkuBooster Team kennen. E-Bike Akku-Spezialisten aus Berlin seit 2019.",
    },
  })
  console.log("  ✓ Ueber uns")

  // ========== KI-CHECK ==========
  await client.createOrReplace({
    _id: "kiCheckPage",
    _type: "kiCheckPage",
    heading: "Kostenloser KI-Check",
    subheading: "Lade ein Foto deines Akkus hoch — unsere KI erkennt automatisch Marke, Modell und sichtbare Schaeden.",
    steps: [
      { _key: "s1", number: "1", title: "Foto aufnehmen", description: "Mach ein Foto von deinem Akku (Typenschild sichtbar)" },
      { _key: "s2", number: "2", title: "KI analysiert", description: "Marke, Modell und Schaeden werden in 60s erkannt" },
      { _key: "s3", number: "3", title: "Ergebnis erhalten", description: "Empfehlung + Preis — unverbindlich und kostenlos" },
    ],
    alternativeText: "Alternativ: Marke direkt waehlen oder Symptom beschreiben",
    seo: {
      _type: "seo",
      title: "Kostenloser KI-Check | AkkuBooster",
      description: "Lade ein Foto deines Akkus hoch. Unsere KI erkennt Marke, Modell und Schaeden in 60 Sekunden.",
    },
  })
  console.log("  ✓ KI-Check")

  // ========== ERSATZAKKU ==========
  await client.createOrReplace({
    _id: "ersatzakkuPage",
    _type: "ersatzakkuPage",
    heading: "Ersatzakku finden",
    subheading: "Dein Akku ist nicht mehr zu retten? Wir finden den passenden Ersatz fuer dein Modell.",
    advantages: [
      { _key: "a1", icon: "✅", title: "100% kompatibel", description: "Wir pruefen die Kompatibilitaet mit deinem E-Bike." },
      { _key: "a2", icon: "💰", title: "Faire Preise", description: "Oft guenstiger als direkt beim Hersteller." },
      { _key: "a3", icon: "🔋", title: "Markenqualitaet", description: "Nur Akkus mit hochwertigen Samsung/LG Zellen." },
    ],
    comparisonHeading: "Reparatur oder Ersatz?",
    comparisonText: "Nicht sicher, ob sich eine Reparatur lohnt? Unser KI-Check hilft dir bei der Entscheidung.",
    ctaPrimary: { _type: "cta", label: "KI-Check starten", href: "/ki-check", variant: "primary" },
    seo: {
      _type: "seo",
      title: "Ersatzakku | AkkuBooster",
      description: "Ersatzakku fuer dein E-Bike. 100% kompatibel, faire Preise, Markenqualitaet.",
    },
  })
  console.log("  ✓ Ersatzakku")

  // ========== FAQ ==========
  await client.createOrReplace({
    _id: "faqPage",
    _type: "faqPage",
    heading: "Haeufig gestellte Fragen",
    subheading: "Hier findest du Antworten auf die wichtigsten Fragen rund um unsere Services.",
    categories: [
      {
        _key: "c1",
        categoryTitle: "Reparatur & Service",
        items: [
          { _key: "i1", question: "Was kostet eine Akku-Reparatur?", answer: "Die Kosten haengen vom Akku-Typ und Schadensumfang ab. Ein Zellentausch kostet ab 249 EUR." },
          { _key: "i2", question: "Wie lange dauert die Reparatur?", answer: "Die meisten Reparaturen sind in 24-72 Stunden erledigt." },
          { _key: "i3", question: "Gibt es eine Garantie?", answer: "Ja, auf jede Reparatur geben wir 12 Monate Garantie." },
        ],
      },
      {
        _key: "c2",
        categoryTitle: "Versand & Logistik",
        items: [
          { _key: "i4", question: "Wie versende ich meinen Akku?", answer: "Wir senden dir ein vorfrankiertes Versandlabel zu." },
          { _key: "i5", question: "Ist der Versand kostenlos?", answer: "Ja, Hin- und Rueckversand innerhalb Deutschlands sind kostenlos." },
        ],
      },
      {
        _key: "c3",
        categoryTitle: "KI-Check",
        items: [
          { _key: "i6", question: "Ist der KI-Check wirklich kostenlos?", answer: "Ja, der KI-Check ist voellig kostenlos und unverbindlich." },
          { _key: "i7", question: "Wie genau ist die KI-Analyse?", answer: "Unsere KI erkennt die meisten gaengigen Marken und Modelle mit ueber 90% Genauigkeit." },
        ],
      },
    ],
    seo: {
      _type: "seo",
      title: "FAQ | AkkuBooster",
      description: "Antworten auf haeufige Fragen zu Akku-Reparatur, Zellentausch, Versand und KI-Check.",
    },
  })
  console.log("  ✓ FAQ")

  // ========== VERGLEICH ==========
  await client.createOrReplace({
    _id: "vergleichPage",
    _type: "vergleichPage",
    heading: "Reparatur vs. Neukauf",
    subheading: "Lohnt sich eine Reparatur? Wir vergleichen fuer dich.",
    comparisonRows: [
      { _key: "c1", aspect: "Kosten", repair: "Ab 249 EUR", newBuy: "500-1.500 EUR", winner: "repair" },
      { _key: "c2", aspect: "Dauer", repair: "24-72 Stunden", newBuy: "1-4 Wochen Lieferzeit", winner: "repair" },
      { _key: "c3", aspect: "Nachhaltigkeit", repair: "Ressourcenschonend", newBuy: "Neuer Rohstoffverbrauch", winner: "repair" },
      { _key: "c4", aspect: "Garantie", repair: "12 Monate", newBuy: "24 Monate (Hersteller)", winner: "newBuy" },
      { _key: "c5", aspect: "Kompatibilitaet", repair: "100% (gleicher Akku)", newBuy: "Muss geprueft werden", winner: "repair" },
    ],
    conclusionHeading: "Unser Fazit",
    conclusionText: "In den meisten Faellen ist eine Reparatur die bessere Wahl — guenstiger, schneller und nachhaltiger. Nur bei schweren Strukturschaeden empfehlen wir einen Ersatzakku.",
    ctaPrimary: { _type: "cta", label: "Jetzt KI-Check starten", href: "/ki-check", variant: "primary" },
    seo: {
      _type: "seo",
      title: "Akku Reparatur vs. Neukauf | AkkuBooster",
      description: "Lohnt sich eine Akku-Reparatur? Vergleich: Kosten, Dauer, Nachhaltigkeit. AkkuBooster Berlin.",
    },
  })
  console.log("  ✓ Vergleich")

  // ========== RATGEBER ==========
  await client.createOrReplace({
    _id: "ratgeberPage",
    _type: "ratgeberPage",
    heading: "Akku-Ratgeber",
    subheading: "Tipps und Wissen rund um E-Bike Akkus — Pflege, Lagerung, Lebensdauer.",
    seo: {
      _type: "seo",
      title: "Akku-Ratgeber | AkkuBooster",
      description: "Tipps fuer E-Bike Akku-Pflege, richtige Lagerung und maximale Lebensdauer.",
    },
  })
  console.log("  ✓ Ratgeber")

  // ========== MARKEN ==========
  await client.createOrReplace({
    _id: "markenPage",
    _type: "markenPage",
    heading: "Unterstuetzte Marken",
    subheading: "Wir reparieren Akkus von ueber {{count}} Marken. Finde deine Marke:",
    seo: {
      _type: "seo",
      title: "Alle Marken | AkkuBooster",
      description: "AkkuBooster repariert Akkus von 110+ Marken: Bosch, Shimano, Yamaha, Brose und mehr.",
    },
  })
  console.log("  ✓ Marken")

  // ========== SYMPTOME ==========
  await client.createOrReplace({
    _id: "symptomePage",
    _type: "symptomePage",
    heading: "Akku-Symptome erkennen",
    subheading: "Waehle das Symptom, das auf deinen Akku zutrifft — wir zeigen dir die Loesung.",
    ctaHeading: "Nicht sicher?",
    ctaText: "Unser KI-Check analysiert deinen Akku anhand eines Fotos.",
    seo: {
      _type: "seo",
      title: "Akku-Symptome | AkkuBooster",
      description: "E-Bike Akku Probleme erkennen: Kapazitaetsverlust, BMS-Fehler, Ladeproblem. AkkuBooster hilft.",
    },
  })
  console.log("  ✓ Symptome")

  // ========== RECHTSTEXTE ==========
  const legalPages = [
    { slug: "impressum", title: "Impressum" },
    { slug: "datenschutz", title: "Datenschutzerklaerung" },
    { slug: "agb", title: "Allgemeine Geschaeftsbedingungen" },
    { slug: "widerruf", title: "Widerrufsbelehrung" },
    { slug: "battg", title: "Hinweise nach Batteriegesetz (BattG)" },
    { slug: "cookie-richtlinie", title: "Cookie-Richtlinie" },
    { slug: "versand", title: "Versand & Retoure" },
  ]

  for (const page of legalPages) {
    await client.createOrReplace({
      _id: `legalPage-${page.slug}`,
      _type: "legalPage",
      title: page.title,
      slug: { _type: "slug", current: page.slug },
      isPlaceholder: true,
      body: [
        {
          _type: "block",
          _key: `block-${page.slug}`,
          style: "normal",
          children: [
            {
              _type: "span",
              _key: `span-${page.slug}`,
              text: `${page.title} — Inhalt wird in Kuerze ergaenzt. Bitte kontaktiere uns bei Fragen.`,
            },
          ],
        },
      ],
      seo: {
        _type: "seo",
        title: `${page.title} | AkkuBooster`,
        description: `${page.title} der AkkuBooster GmbH, Berlin.`,
      },
    })
    console.log(`  ✓ ${page.title}`)
  }

  console.log("\n✅ Alle Inhalte wurden erfolgreich in Sanity geladen!")
  console.log("   Oeffne das Sanity Studio um die Inhalte zu bearbeiten.")
}

seed().catch(console.error)
