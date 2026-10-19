export const homeSurfaces = ["hero", "about", "services", "contact", "portfolio"] as const;

export type HomeSurface = (typeof homeSurfaces)[number];
export type HomeMediaMode = "single" | "sequence";
export type HomeMediaKind = "IMAGE" | "GIF" | "VIDEO";

export type HomeFrame = {
  src: string;
  kind: HomeMediaKind;
};

export function isHomeSurface(value: string): value is HomeSurface {
  return homeSurfaces.includes(value as HomeSurface);
}

export function isHomeMediaMode(value: string): value is HomeMediaMode {
  return value === "single" || value === "sequence";
}

export function kindFromMime(type: string | null | undefined): HomeMediaKind {
  if (type === "video/mp4" || type === "video/webm") return "VIDEO";
  if (type === "image/gif") return "GIF";
  return "IMAGE";
}

export function modeField(surface: HomeSurface) {
  if (surface === "hero") return "portraitMode" as const;
  if (surface === "about") return "aboutMode" as const;
  if (surface === "services") return "servicesMode" as const;
  if (surface === "contact") return "contactMode" as const;
  return "portfolioMode" as const;
}
