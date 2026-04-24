import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import { draftMode } from "next/headers"
import SanityVisualEditing from "@lib/sanity/visual-editing"
import ChatWidget from "@modules/chat/components/chat-widget"
import "styles/globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const draft = await draftMode()

  return (
    <html lang="de" data-mode="light" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <main className="relative">{props.children}</main>
        <ChatWidget />
        {draft.isEnabled && <SanityVisualEditing />}
      </body>
    </html>
  )
}
