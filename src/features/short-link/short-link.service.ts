import { isBefore } from "date-fns";
import { nanoid } from "nanoid";
import { fromZonedTime } from "date-fns-tz";

import { redis } from "@/lib/redis";

import type { ShortLinkRepository } from "./repository/short-link.repository";
import type { CreateShortLinkParams } from "./types";
import { BadRequestError, NotFoundError } from "@/errors";
import { SHORT_LINK_ERROR_MESSAGES } from "@/constants/link";
import type { ShortLink } from "./short-link.model";
import { incrementClickQueue } from "@/lib/bullmq/queues/increment-link-click-queue";

function isForbiddenUrl(url: string, forbiddenList: string[]) {
  return forbiddenList.some((forbidden) => url.includes(forbidden));
}

export async function createShortLink({
  repo,
  data,
  forbiddenUrls,
}: CreateShortLinkParams) {
  let expiresAt = data.expiresAt as Date | undefined;

  if (
    !data.destination.startsWith("http://") &&
    !data.destination.startsWith("https://")
  ) {
    throw new BadRequestError(SHORT_LINK_ERROR_MESSAGES.INVALID_URL);
  }

  if (isForbiddenUrl(data.destination, forbiddenUrls || [])) {
    throw new BadRequestError(SHORT_LINK_ERROR_MESSAGES.FORBIDDEN_URL);
  }

  if (data.customAlias) {
    const customAliasAlreadyExists = await repo.findByCode(data.customAlias);

    if (customAliasAlreadyExists) {
      throw new BadRequestError(
        SHORT_LINK_ERROR_MESSAGES.CUSTOM_ALIAS_ALREADY_EXISTS
      );
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(data.customAlias)) {
      throw new BadRequestError(
        SHORT_LINK_ERROR_MESSAGES.CUSTOM_ALIAS_INVALID_CHARACTERS
      );
    }
  }

  if (expiresAt) {
    expiresAt = new Date(expiresAt);

    const expiresAtIsBeforeToday = isBefore(
      expiresAt,
      fromZonedTime(new Date(), "UTC")
    );

    if (expiresAtIsBeforeToday) {
      throw new BadRequestError(
        SHORT_LINK_ERROR_MESSAGES.EXPIRATION_DATE_IN_PAST
      );
    }
  }

  const code = data.customAlias ?? nanoid(8);

  const shortLink = await repo.createShortLink({ ...data, code, expiresAt });

  return { shortLink };
}

export async function getShortLinkToRedirect(
  repo: ShortLinkRepository,
  code: string
) {
  const cacheKey = `shortlink:${code}`;

  const cached = await redis.get(cacheKey);

  let shortLink: ShortLink = cached
    ? JSON.parse(cached)
    : await repo.findByCode(code);

  if (!shortLink) {
    throw new NotFoundError(SHORT_LINK_ERROR_MESSAGES.CODE_NOT_FOUND);
  }

  if (!cached) {
    const { clicks, ...staticData } = shortLink;
    await redis.set(cacheKey, JSON.stringify(staticData), { EX: 60 });
  }

  if (shortLink.expiresAt) {
    if (isBefore(shortLink.expiresAt, fromZonedTime(new Date(), "UTC"))) {
      throw new BadRequestError(SHORT_LINK_ERROR_MESSAGES.SHORT_LINK_EXPIRED);
    }
  }

  const redisClicksKey = `shortlink-clicks:${code}`;

  const currentClicks =
    Number(await redis.get(redisClicksKey)) || shortLink.clicks || 0;

  if (shortLink.maxClicks != null) {
    if (currentClicks >= shortLink.maxClicks) {
      throw new BadRequestError(
        SHORT_LINK_ERROR_MESSAGES.MAXIMUM_CLICKS_EXCEEDED
      );
    }
  }

  const updatedClicks = await redis.incr(redisClicksKey);

  await incrementClickQueue.add("increment-click", {
    code,
    id: shortLink.id,
    clicks: updatedClicks,
  });

  return { shortLink };
}
