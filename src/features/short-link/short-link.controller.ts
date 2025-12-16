import type { FastifyReply, FastifyRequest } from "fastify";

import * as shortLinkService from "./short-link.service";
import * as shortLinkRepo from "./repository/drizzle-short-link.repository";
import { createShortLinkSchema, getShortLinkSchema } from "./schemas";
import { HTTP_STATUS } from "@/constants";
import type { CreateShortLinkPayload } from "./types";

export async function createShortLinkHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const body = createShortLinkSchema.parse(request.body);

  const forbiddenUrls = process.env.FORBIDDEN_URLS?.split(",") ?? [];

  const { shortLink } = await shortLinkService.createShortLink({
    repo: shortLinkRepo,
    data: body as CreateShortLinkPayload,
    forbiddenUrls,
  });

  return reply.status(HTTP_STATUS.CREATED).send({ data: shortLink });
}

export async function redirectHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { code } = getShortLinkSchema.parse(request.params);

  const { shortLink } = await shortLinkService.getShortLinkToRedirect(
    shortLinkRepo,
    code
  );

  return reply
    .status(HTTP_STATUS.TEMPORARY_REDIRECT)
    .redirect(shortLink.destination);
}
