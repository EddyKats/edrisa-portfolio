import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import localFont from "next/font/local";
import { personIdentity, studioBrand } from "@/data/identity";
import { Analytics } from "@/components/site/Analytics";
import { JsonLd } from "@/components/site/JsonLd";
import { absoluteAsset, siteGraph } from "@/lib/content/jsonld";
import { getPublicSite } from "@/lib/content/site";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700", "800"],
  variable: "--font-manrope",
});

const lufga = localFont({
  src: [
    { path: "../fonts/LufgaLight.ttf", weight: "300", style: "normal" },
    { path: "../fonts/LufgaSemiBold.ttf", weight: "600", style: "normal" },
    { path: "../fonts/LufgaExtraBold.ttf", weight: "800", style: "normal" },
  ],
  display: "swap",
  variable: "--font-lufga",
});

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getPublicSite();
  const google = process.env.GOOGLE_SITE_VERIFICATION?.trim();
  return {
    metadataBase: new URL(site.url),
    title: {
      default: site.title,
      template: `%s · ${studioBrand.name}`,
    },
    description: site.description,
    applicationName: studioBrand.name,
    authors: [{ name: personIdentity.name, url: site.url }],
    creator: personIdentity.name,
    keywords: [
      "Kasibante Edrisa",
      "Edrisa",
      "Kasibante",
      "Edrisa Studio",
      "graphic designer",
      "branding",
      "web development",
      "app development",
    ],
    openGraph: {
      type: "website",
      locale: "en_US",
      url: site.url,
      siteName: studioBrand.name,
      title: site.title,
      description: site.description,
    },
    twitter: {
      card: "summary_large_image",
      title: site.title,
      description: site.description,
    },
    robots: {
      index: true,
      follow: true,
    },
    verification: google ? { google } : undefined,
  };
}

export const viewport: Viewport = {
  themeColor: "#3a291f",
  colorScheme: "dark",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const site = await getPublicSite();
  const portrait = absoluteAsset(site.url, site.portraitSrc);

  return (
    <html lang="en" className={`${manrope.variable} ${lufga.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">
        <JsonLd data={siteGraph(site, portrait)} />
        <Analytics />
        {children}
      </body>
    </html>
  );
}
