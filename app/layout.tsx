import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import localFont from "next/font/local";
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
  return {
    metadataBase: new URL(site.url),
    title: {
      default: site.title,
      template: `%s · ${site.name}`,
    },
    description: site.description,
    applicationName: site.name,
    authors: [{ name: site.name, url: site.url }],
    creator: site.name,
    keywords: ["edrisa", "creative director", "brand designer", "portfolio", "branding"],
    openGraph: {
      type: "website",
      locale: "en_US",
      url: site.url,
      siteName: site.name,
      title: site.title,
      description: site.description,
    },
    twitter: {
      card: "summary",
      title: site.title,
      description: site.description,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#3a291f",
  colorScheme: "dark",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const site = await getPublicSite();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.name,
    url: site.url,
    jobTitle: "Creative Director and Brand Designer",
    description: site.description,
  };

  return (
    <html lang="en" className={`${manrope.variable} ${lufga.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
