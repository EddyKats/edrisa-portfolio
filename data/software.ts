import type { IconType } from "react-icons";
import {
  TbBrandAdobeAfterEffect,
  TbBrandAdobeIllustrator,
  TbBrandAdobeIndesign,
  TbBrandAdobePhotoshop,
  TbBrandAdobePremiere,
  TbBrandFigma,
} from "react-icons/tb";

export const softwareIds = [
  "photoshop",
  "illustrator",
  "indesign",
  "after-effects",
  "premiere-pro",
  "figma",
] as const;

export type SoftwareId = (typeof softwareIds)[number];

export const softwareRegistry: Record<SoftwareId, { label: string; shortLabel: string; Icon: IconType }> = {
  photoshop: { label: "Adobe Photoshop", shortLabel: "Photoshop", Icon: TbBrandAdobePhotoshop },
  illustrator: { label: "Adobe Illustrator", shortLabel: "Illustrator", Icon: TbBrandAdobeIllustrator },
  indesign: { label: "Adobe InDesign", shortLabel: "InDesign", Icon: TbBrandAdobeIndesign },
  "after-effects": { label: "Adobe After Effects", shortLabel: "After Effects", Icon: TbBrandAdobeAfterEffect },
  "premiere-pro": { label: "Adobe Premiere Pro", shortLabel: "Premiere Pro", Icon: TbBrandAdobePremiere },
  figma: { label: "Figma", shortLabel: "Figma", Icon: TbBrandFigma },
};
