export type AnalyticsEventName =
  | "page_view"
  | "portfolio_project_view"
  | "portfolio_project_click"
  | "whatsapp_click"
  | "email_click"
  | "phone_click"
  | "contact_page_view"
  | "social_link_click"
  | "portfolio_image_open"
  | "scroll_depth"
  | "project_engagement"
  | "outbound_link_click";

export type AnalyticsValue = string | number | boolean | undefined;
export type AnalyticsParams = Record<string, AnalyticsValue>;

type Gtag = (command: "event" | "config" | "js", eventName: string | Date, parameters?: AnalyticsParams) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
  }
}

const localHosts = new Set(["localhost", "127.0.0.1", "[::1]"]);

export function isLocalAnalyticsHost() {
  if (typeof window === "undefined") return false;
  return localHosts.has(window.location.hostname);
}

export function trackEvent(name: AnalyticsEventName, parameters: AnalyticsParams = {}) {
  if (typeof window === "undefined" || typeof window.gtag !== "function" || isLocalAnalyticsHost()) return false;
  const payload: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(parameters)) {
    if (value !== undefined) payload[key] = value;
  }
  window.gtag("event", name, payload);
  return true;
}

export function trackPageView(path: string, parameters: AnalyticsParams = {}) {
  trackEvent("page_view", {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
    ...parameters,
  });
}
