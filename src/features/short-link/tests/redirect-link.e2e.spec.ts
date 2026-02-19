import { afterAll, beforeAll, afterEach, expect, it, describe } from "vitest";
import type { FastifyInstance } from "fastify";
import { fromZonedTime } from "date-fns-tz";

import { buildApp } from "@/index";
import { db } from "@/db";
import { shortLinkTable } from "@/db/schema/short-link";
import * as shortLinkRepository from "../repository/drizzle-short-link.repository";
import { SHORT_LINK_ERROR_MESSAGES } from "@/constants/link";
import { redis } from "@/lib/redis";

let app: FastifyInstance;

beforeAll(async () => {
  app = buildApp();
  await app.ready();
});

afterAll(async () => {
  await app.close();
  await redis.quit();
});

afterEach(async () => {
  await db.delete(shortLinkTable);
  await redis.flushAll();
});

describe("GET /api/links/redirect/:code - E2E", () => {
  it("should return a error if code does not exists", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/links/redirect/invalid-code",
    });

    expect(response.statusCode).toBe(404);

    const body = response.json();

    expect(body.message).toBe(SHORT_LINK_ERROR_MESSAGES.CODE_NOT_FOUND);
  });

  it("should return a error if code is expired", async () => {
    await shortLinkRepository.createShortLink({
      destination: "https://example.com",
      code: "myCode2",
      expiresAt: fromZonedTime(new Date(Date.now() - 1000), "UTC"),
    });

    const response = await app.inject({
      method: "GET",
      url: "/api/links/redirect/myCode2",
    });

    expect(response.statusCode).toBe(400);

    const body = response.json();

    expect(body.message).toBe(SHORT_LINK_ERROR_MESSAGES.SHORT_LINK_EXPIRED);
  });

  it("should return a error if max clicks is reached", async () => {
    await shortLinkRepository.createShortLink({
      destination: "https://example.com",
      code: "myCode",
      maxClicks: 1,
    });

    await app.inject({
      method: "GET",
      url: "/api/links/redirect/myCode",
    });

    const response = await app.inject({
      method: "GET",
      url: "/api/links/redirect/myCode",
    });

    expect(response.statusCode).toBe(400);

    const body = response.json();

    expect(body.message).toBe(
      SHORT_LINK_ERROR_MESSAGES.MAXIMUM_CLICKS_EXCEEDED
    );
  });
});
