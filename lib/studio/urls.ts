import { z } from "zod";

export const whatsappUrlSchema = z
  .string()
  .trim()
  .transform((value) => value.replace(/^http:\/\/wa\.me\//, "https://wa.me/").replace(/\s+/g, ""))
  .pipe(z.string().regex(/^https:\/\/wa\.me\/\d+$/, "WhatsApp must use https://wa.me/ followed by digits."));

export const httpsUrlSchema = z
  .string()
  .trim()
  .url("Enter a full https URL.")
  .refine((value) => {
    try {
      return new URL(value).protocol === "https:";
    } catch {
      return false;
    }
  }, "Enter a full https URL.");

export const safeHrefSchema = z
  .string()
  .trim()
  .min(1, "Add a destination.")
  .refine((value) => {
    if (value.startsWith("/") && !value.startsWith("//")) return !value.toLowerCase().includes("javascript:");
    try {
      return new URL(value).protocol === "https:";
    } catch {
      return false;
    }
  }, "Use a site path or an https URL.");

export const optionalText = z.string().trim().transform((value) => (value.length > 0 ? value : null));

export const socialUrlSchema = z.object({
  behanceUrl: httpsUrlSchema,
  linkedinUrl: httpsUrlSchema,
  whatsappUrl: whatsappUrlSchema,
});
