/** Turn a stored phone string into a tel: URI. Returns null when it has no usable number. */
export function toTelHref(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length < 8 || digits.length > 15) return null;
  return `tel:${hasPlus ? "+" : ""}${digits}`;
}

/** Read the public number already stored in a WhatsApp link. Does not invent a second number. */
export function telFromWhatsapp(url: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  const host = parsed.hostname.replace(/^www\./, "");
  let digits = "";
  if (host === "wa.me") {
    digits = parsed.pathname.replace(/\D/g, "");
  } else if (host === "api.whatsapp.com") {
    digits = (parsed.searchParams.get("phone") ?? "").replace(/\D/g, "");
  }
  if (digits.length < 8 || digits.length > 15) return null;
  return `tel:+${digits}`;
}

export function displayFromTelHref(href: string): string {
  const digits = href.replace(/\D/g, "");
  if (digits.startsWith("256") && digits.length === 12) {
    return `+256 ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9)}`;
  }
  return href.startsWith("tel:") ? href.slice(4) : href;
}

export function resolveCallHref(
  phones: Array<string | null | undefined>,
  whatsappUrl: string,
): string | null {
  for (const phone of phones) {
    if (!phone) continue;
    const href = toTelHref(phone);
    if (href) return href;
  }
  return telFromWhatsapp(whatsappUrl);
}
