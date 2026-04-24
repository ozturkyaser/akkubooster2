import { NextRequest, NextResponse } from "next/server"

const DIAGNOSE_SUPABASE_URL = process.env.DIAGNOSE_SUPABASE_URL || "https://nzydewwmbxbksfvgrecj.supabase.co"
const DIAGNOSE_SUPABASE_ANON_KEY = process.env.DIAGNOSE_SUPABASE_ANON_KEY || ""
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || ""

// Fetch workshop data from Diagnose Supabase
async function fetchWorkshopContext() {
  if (!DIAGNOSE_SUPABASE_ANON_KEY) return null

  const headers = {
    apikey: DIAGNOSE_SUPABASE_ANON_KEY,
    Authorization: `Bearer ${DIAGNOSE_SUPABASE_ANON_KEY}`,
    "Content-Type": "application/json",
  }

  try {
    const [categoriesRes, repairOrdersRes] = await Promise.all([
      fetch(`${DIAGNOSE_SUPABASE_URL}/rest/v1/categories?select=*`, { headers, next: { revalidate: 300 } }),
      fetch(`${DIAGNOSE_SUPABASE_URL}/rest/v1/repair_orders?select=order_number,status,created_at&order=created_at.desc&limit=5`, { headers, next: { revalidate: 60 } }),
    ])

    const categories = categoriesRes.ok ? await categoriesRes.json() : []
    const recentOrders = repairOrdersRes.ok ? await repairOrdersRes.json() : []

    return { categories, recentOrders }
  } catch {
    return null
  }
}

// Knowledge base for the chatbot
const KNOWLEDGE_BASE = `
Du bist der AkkuBooster Assistent — ein freundlicher, kompetenter Chatbot fuer akkubooster.de.

UNTERNEHMEN:
- AkkuBooster ist eine Berliner Werkstatt fuer E-Bike, E-Scooter und E-Cargo Akku-Reparatur
- Adresse: Piesporterstr. 34, 13088 Berlin (Pankow)
- Telefon: +49 30 12345678
- E-Mail: info@akkubooster.de
- Oeffnungszeiten: Mo-Fr 9-18 Uhr, Sa 10-14 Uhr

SERVICES & PREISE:
- Zellentausch: ab 299 EUR — defekte Zellen durch Markenzellen ersetzen
- Akku-Diagnose: Kostenlos — 4D-Diagnose (Spannung, Kapazitaet, Innenwiderstand, BMS)
- Balancing: ab 99 EUR — Zellen kalibrieren fuer optimale Reichweite
- Kapazitaets-Boost: ab 449 EUR — Upgrade auf Zellen mit hoeherer Kapazitaet
- Ersatzakku: Individueller Preis je nach Modell

ABLAUF:
1. Kostenloser KI-Check (Foto hochladen) oder Marke waehlen
2. Akku einsenden (kostenloses Versandlabel innerhalb DE)
3. Diagnose innerhalb 24h
4. Angebot erhalten, nach Freigabe Reparatur
5. Rueckversand mit 12 Monaten Garantie

VERSAND:
- Deutschland: Kostenloser Hin- und Rueckversand
- Oesterreich: 9,90 EUR Pauschale
- Schweiz: 14,90 EUR Pauschale
- Bearbeitungszeit: 3-5 Werktage nach Freigabe

MARKEN: Bosch, Shimano, Yamaha, Brose, BMZ, Samsung SDI, BionX und 20+ weitere

GARANTIE: 12 Monate auf jede Reparatur

REGELN:
- Antworte immer auf Deutsch
- Sei freundlich, hilfsbereit und praezise
- Empfehle bei Unsicherheit den kostenlosen KI-Check oder den Kontakt per Telefon/E-Mail
- Nenne keine Informationen, die du nicht sicher weisst
- Halte Antworten kurz (2-4 Saetze)
- Wenn der Kunde nach seinem Auftragsstatus fragt, bitte ihn um die Auftragsnummer
`

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    // Get workshop context from ERP
    const workshopData = await fetchWorkshopContext()

    let systemPrompt = KNOWLEDGE_BASE

    if (workshopData) {
      if (workshopData.categories?.length) {
        systemPrompt += `\n\nSERVICE-KATEGORIEN (aus ERP):\n${workshopData.categories.map((c: any) => `- ${c.name} (${c.type})`).join("\n")}`
      }
      if (workshopData.recentOrders?.length) {
        systemPrompt += `\n\nAKTUELLE AUSLASTUNG: ${workshopData.recentOrders.length} aktive Auftraege`
      }
    }

    // Check for order status query
    const lastMessage = messages[messages.length - 1]?.content || ""
    const orderNumberMatch = lastMessage.match(/[Rr]?\d{6,}/)?.[0]

    if (orderNumberMatch && DIAGNOSE_SUPABASE_ANON_KEY) {
      try {
        const orderRes = await fetch(
          `${DIAGNOSE_SUPABASE_URL}/rest/v1/repair_orders?order_number=eq.${orderNumberMatch}&select=order_number,status,created_at,last_updated`,
          {
            headers: {
              apikey: DIAGNOSE_SUPABASE_ANON_KEY,
              Authorization: `Bearer ${DIAGNOSE_SUPABASE_ANON_KEY}`,
            },
          }
        )
        if (orderRes.ok) {
          const orders = await orderRes.json()
          if (orders.length > 0) {
            const order = orders[0]
            systemPrompt += `\n\nAUFTRAGSSTATUS GEFUNDEN:\n- Auftragsnummer: ${order.order_number}\n- Status: ${order.status}\n- Erstellt: ${order.created_at}\n- Letztes Update: ${order.last_updated}\n\nTeile dem Kunden diesen Status mit.`
          }
        }
      } catch {
        // Ignore order lookup errors
      }
    }

    // If Anthropic API key is available, use Claude
    if (ANTHROPIC_API_KEY) {
      const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 512,
          system: systemPrompt,
          messages: messages.slice(-10).map((m: any) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      if (anthropicRes.ok) {
        const data = await anthropicRes.json()
        return NextResponse.json({
          reply: data.content[0]?.text || "Entschuldigung, ich konnte keine Antwort generieren.",
        })
      }
    }

    // Fallback: Rule-based responses
    const reply = generateFallbackReply(lastMessage)
    return NextResponse.json({ reply })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json(
      { error: "Etwas ist schiefgelaufen. Bitte versuche es erneut." },
      { status: 500 }
    )
  }
}

function generateFallbackReply(message: string): string {
  const lower = message.toLowerCase()

  if (lower.match(/hallo|hi|hey|guten tag|moin/)) {
    return "Hallo! Willkommen bei AkkuBooster. Wie kann ich dir bei deinem E-Bike Akku helfen?"
  }
  if (lower.match(/preis|kosten|was kostet|teuer|guenstig/)) {
    return "Unsere Preise: Zellentausch ab 299 EUR, Balancing ab 99 EUR, Kapazitaets-Boost ab 449 EUR. Die Diagnose ist immer kostenlos! Moechtest du einen kostenlosen KI-Check starten?"
  }
  if (lower.match(/dauer|wie lange|wartezeit|zeit/)) {
    return "Die Diagnose dauert 24 Stunden nach Eingang. Die Reparatur selbst braucht 3-5 Werktage nach deiner Freigabe. Insgesamt ca. 5-10 Werktage."
  }
  if (lower.match(/versand|schicken|senden|einsenden|lieferung/)) {
    return "Innerhalb Deutschlands ist der Hin- und Rueckversand kostenlos! Du erhaeltst nach der Auftragsbestaetigung ein vorfrankiertes DHL-Versandlabel per E-Mail."
  }
  if (lower.match(/garantie|gewaehr/)) {
    return "Auf jede Reparatur geben wir 12 Monate Garantie. Qualitaet und Zuverlaessigkeit stehen bei uns an erster Stelle."
  }
  if (lower.match(/marke|bosch|shimano|yamaha|brose/)) {
    return "Wir reparieren Akkus von ueber 25 Marken: Bosch, Shimano, Yamaha, Brose, BMZ, Samsung SDI und viele mehr. Schau dir unsere Marken-Seite an oder starte den kostenlosen KI-Check!"
  }
  if (lower.match(/adresse|wo |standort|werkstatt|berlin|vor ort/)) {
    return "Unsere Werkstatt ist in Berlin-Pankow: Piesporterstr. 34, 13088 Berlin. Oeffnungszeiten: Mo-Fr 9-18 Uhr, Sa 10-14 Uhr. Bitte vorher telefonisch Termin vereinbaren!"
  }
  if (lower.match(/auftrag|status|bestellung|nummer/)) {
    return "Gib mir bitte deine Auftragsnummer (z.B. R123456789), dann kann ich den aktuellen Status fuer dich pruefen!"
  }
  if (lower.match(/kontakt|telefon|email|anruf|erreich/)) {
    return "Du erreichst uns unter +49 30 12345678 (Mo-Fr 9-18, Sa 10-14) oder per E-Mail an info@akkubooster.de. Wir helfen dir gerne weiter!"
  }
  if (lower.match(/reparatur|kaputt|defekt|funktioniert nicht|problem/)) {
    return "Wir koennen dir bestimmt helfen! Starte am besten mit unserem kostenlosen KI-Check — einfach ein Foto deines Akkus hochladen und in 60 Sekunden erhaeltst du eine erste Einschaetzung."
  }

  return "Gute Frage! Fuer eine individuelle Beratung empfehle ich dir unseren kostenlosen KI-Check (Foto hochladen) oder kontaktiere uns direkt unter +49 30 12345678. Kann ich dir sonst noch helfen?"
}
