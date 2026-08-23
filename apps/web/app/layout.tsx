import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { VisitTracker } from "@/components/visit-tracker";
import { THEME_SCRIPT } from "@/lib/theme";
import { getLocale } from "@/lib/i18n/server";
import { dir } from "@/lib/i18n/config";
import { I18nProvider } from "@/lib/i18n/provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Trovework — Hire freelancers you can actually trust",
  description:
    "Trovework connects verified freelancers with clients worldwide. Every user is verified so you can collaborate with confidence.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Detected from the visitor's browser language; sets text direction too (RTL
  // for Arabic) and feeds the client dictionary.
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      dir={dir(locale)}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      // The theme script adds `dark` to this element before React hydrates, so
      // the server's class list is expected not to match the client's.
      suppressHydrationWarning
    >
      {/* Header and footer live here so every route gets the same chrome —
          pages render only their own content. */}
      <body className="min-h-full flex flex-col">
        {/* First thing in the body: applies the stored theme before anything
            paints, so there is no white flash on the way into dark mode. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <I18nProvider locale={locale}>
          <VisitTracker />
          <SiteHeader />
          {children}
          <SiteFooter />
        </I18nProvider>
      </body>
    </html>
  );
}
