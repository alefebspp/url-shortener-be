import { afterAll, beforeAll, afterEach, expect, it, describe } from "vitest";
import type { FastifyInstance } from "fastify";

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

describe("POST /api/links - E2E", () => {
  it("should create a short link", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/links",
      payload: {
        destination: "https://google.com",
      },
    });

    expect(response.statusCode).toBe(201);

    const body = response.json();

    expect(body.data.destination).toBe("https://google.com");

    const dbLink = await shortLinkRepository.findByCode(body.data.code);

    expect(dbLink).not.toBeNull();
  });

  it("should return a error if custom alias already exists", async () => {
    await shortLinkRepository.createShortLink({
      destination: "https://example.com",
      code: "myCode",
    });

    const response = await app.inject({
      method: "POST",
      url: "/api/links",
      payload: {
        destination: "https://google.com",
        customAlias: "myCode",
      },
    });

    expect(response.statusCode).toBe(400);

    const body = response.json();

    expect(body.message).toBe(
      SHORT_LINK_ERROR_MESSAGES.CUSTOM_ALIAS_ALREADY_EXISTS
    );
  });

  it("should return a error if expirestAt is in the past", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/links",
      payload: {
        destination: "https://google.com",
        expiresAt: "2000-01-01T00:00:00.000Z",
      },
    });

    expect(response.statusCode).toBe(400);

    const body = response.json();

    expect(body.message).toBe(
      SHORT_LINK_ERROR_MESSAGES.EXPIRATION_DATE_IN_PAST
    );
  });
});
