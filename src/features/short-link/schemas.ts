import z from "zod";

export const createShortLinkSchema = z.object({
  destination: z.url(),
  customAlias: z
    .string()
    .max(30)
    .regex(/^[a-zA-Z0-9_-]*$/)
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  title: z.string().optional(),
  expiresAt: z.iso.datetime().optional(),
  maxClicks: z.number().min(1).optional(),
  ownerId: z.number().optional(),
});

export const getShortLinkSchema = z.object({
  code: z
    .string()
    .regex(/^[a-zA-Z0-9_-]+$/)
    .min(1),
});
