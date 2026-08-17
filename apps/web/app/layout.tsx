import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { THEME_SCRIPT } from "@/lib/theme";
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
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
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
