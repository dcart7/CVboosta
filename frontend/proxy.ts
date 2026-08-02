import { NextRequest, NextResponse } from "next/server";

/**
 * Legacy password-reset emails put the credential in the query string. Move
 * it to a fragment before rendering so it is not sent as a referrer or picked
 * up by page-view tooling. New reset emails are already fragment-first.
 */
export function proxy(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.next();

  const cleanUrl = request.nextUrl.clone();
  cleanUrl.search = "";
  if (token.length <= 4_096) {
    cleanUrl.hash = new URLSearchParams({ token }).toString();
  }
  return NextResponse.redirect(cleanUrl, 303);
}

export const config = {
  matcher: ["/reset-password"],
};
