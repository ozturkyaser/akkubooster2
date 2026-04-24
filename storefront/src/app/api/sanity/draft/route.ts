import { draftMode } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get("sanity-preview-secret")
  const pathname = searchParams.get("sanity-preview-pathname") || "/"

  // Validate that this request comes from the Sanity Presentation Tool
  // The presentation tool sends a secret parameter automatically
  if (!secret) {
    return new NextResponse("Missing preview secret", { status: 401 })
  }

  try {
    const draft = await draftMode()
    draft.enable()

    // Redirect to the requested page
    return NextResponse.redirect(new URL(pathname, request.url))
  } catch (error) {
    console.error("Draft mode error:", error)
    return new NextResponse("Failed to enable draft mode", { status: 500 })
  }
}
