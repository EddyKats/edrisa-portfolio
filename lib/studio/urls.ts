import { z } from "zod";

export const whatsappUrlSchema = z.string().regex(/^https:\/\/wa\.me\/\d+$/);

export const httpUrlSchema = z.string().regex(/^https:\/\/\S+$/);

export const socialUrlSchema = z.object({
  behanceUrl: httpUrlSchema,
  linkedinUrl: httpUrlSchema,
  whatsappUrl: whatsappUrlSchema,
});
