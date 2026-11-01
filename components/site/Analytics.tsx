import Script from "next/script";
import { Suspense } from "react";
import { headers } from "next/headers";
import { Analytics as VercelAnalytics } from "@vercel/analytics/next";
import { AnalyticsListener } from "@/components/site/AnalyticsListener";

function measurementId() {
  const id = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();
  return id && /^G-[A-Z0-9]+$/i.test(id) ? id : undefined;
}

function clarityProjectId() {
  const id = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID?.trim();
  return id && /^[a-z0-9]+$/i.test(id) ? id : undefined;
}

async function trackingEnabled() {
  if (process.env.NODE_ENV !== "production") return false;
  if (process.env.VERCEL_ENV === "preview" || process.env.VERCEL_ENV === "development") return false;
  const headerList = await headers();
  const host = (headerList.get("x-forwarded-host") || headerList.get("host") || "").split(":")[0]?.toLowerCase();
  if (!host || host === "localhost" || host === "127.0.0.1" || host === "[::1]") return false;
  return true;
}

export async function Analytics() {
  const enabled = await trackingEnabled();
  if (!enabled) return null;

  const gaId = measurementId();
  const clarityId = clarityProjectId();

  return (
    <>
      <VercelAnalytics />
      {gaId ? (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${gaId}',{send_page_view:false});`}
          </Script>
          <Suspense fallback={null}>
            <AnalyticsListener />
          </Suspense>
        </>
      ) : null}
      {clarityId ? (
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${clarityId}");`}
        </Script>
      ) : null}
    </>
  );
}
