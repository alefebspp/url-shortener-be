import z from "zod";

import {
  createShortLinkSchema,
  getShortLinkSchema,
} from "@/features/short-link/schemas";
import * as shortLinkController from "../features/short-link/short-link.controller";
import type { FastifyTypedInstance } from "@/types";

async function linkRoutes(app: FastifyTypedInstance) {
  app.post(
    "/",
    {
      schema: {
        operationId: "create link",
        description: "Create a new short link",
        tags: ["Link"],
        body: createShortLinkSchema,
        response: {
          201: z.object({
            data: z.object({
              id: z.number(),
              code: z.string(),
              destination: z.url(),
              customAlias: z.string().nullable().optional(),
              title: z.string().nullable().optional(),
              createdAt: z.date(),
              expiresAt: z.date().nullable().optional(),
              maxClicks: z.number().nullable(),
              clicks: z.number(),
              ownerId: z.number().nullable(),
            }),
          }),
        },
      },
    },
    shortLinkController.createShortLinkHandler
  );

  app.get(
    "/redirect/:code",
    {
      schema: {
        operationId: "redirect link",
        description:
          "Redirect to the destination URL based on the short link code",
        tags: ["Link"],
        params: getShortLinkSchema,
        response: {
          301: z.void(),
        },
      },
    },
    shortLinkController.redirectHandler
  );
}

export default linkRoutes;
