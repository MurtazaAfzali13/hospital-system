import { NextRequest, NextResponse } from "next/server";

const locales = ["en", "fa"];
const defaultLocale = "en";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // ignore next files
  if (
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return;
  }

  const hasLocale = locales.some(
    (locale) =>
      pathname === `/${locale}` ||
      pathname.startsWith(`/${locale}/`)
  );

  if (!hasLocale) {
    return NextResponse.redirect(
      new URL(`/${defaultLocale}${pathname}`, request.url)
    );
  }
}

export const config = {
  matcher: ["/((?!api).*)"],
};
