import { describe, expect, it, vi } from "vitest";

import * as shortLinkService from "./short-link.service";
import { BadRequestError, NotFoundError } from "@/errors";
import { fromZonedTime } from "date-fns-tz";

import { incrementClickQueue } from "@/lib/bullmq/queues/increment-link-click-queue";

const shortLinkRepo = {
  createShortLink: vi.fn(),
  findByCode: vi.fn(),
  update: vi.fn(),
};

vi.mock("nanoid", () => ({
  nanoid: vi.fn(() => "random-alias"),
}));

vi.mock("redis", () => {
  const incr = vi.fn();
  const get = vi.fn();
  const set = vi.fn();

  return {
    createClient: vi.fn(() => ({
      connect: vi.fn(),
      incr,
      get,
      set,
      on: vi.fn(),
    })),
  };
});

const { redis } = await import("@/lib/redis");

vi.mock("@/lib/bullmq/queues/increment-link-click-queue", () => ({
  incrementClickQueue: {
    add: vi.fn(),
  },
}));

describe("Short Link Service", () => {
  describe("createShortLink", () => {
    it("should throw error if destination is a invalid url", async () => {
      await expect(
        shortLinkService.createShortLink(shortLinkRepo, {
          destination: "invalid-url",
        })
      ).rejects.toBeInstanceOf(BadRequestError);
    });

    it("should throw error if custom alias already exists", async () => {
      shortLinkRepo.findByCode = vi.fn().mockResolvedValue({
        id: 1,
        code: "my-custom-alias",
        destination: "https://example.com",
        createdAt: new Date(),
        clicks: 0,
      });

      await expect(
        shortLinkService.createShortLink(shortLinkRepo, {
          destination: "https://example.com",
          customAlias: "my-custom-alias",
        })
      ).rejects.toBeInstanceOf(BadRequestError);
    });

    it("should throw error if custom alias has invalid characters", async () => {
      await expect(
        shortLinkService.createShortLink(shortLinkRepo, {
          destination: "https://example.com",
          customAlias: "my-custom-alias%",
        })
      ).rejects.toBeInstanceOf(BadRequestError);
    });

    it("should throw error if expiresAt is before actual Date", async () => {
      await expect(
        shortLinkService.createShortLink(shortLinkRepo, {
          destination: "https://example.com",
          expiresAt: fromZonedTime(new Date(Date.now() - 1000), "UTC"),
        })
      ).rejects.toBeInstanceOf(BadRequestError);
    });

    it("should generate a random custom alias if value is not present", async () => {
      const shortLinkRepo = {
        createShortLink: vi.fn().mockResolvedValue({
          id: 1,
          code: "random-alias",
          destination: "https://example.com",
          createdAt: new Date(),
          clicks: 0,
        }),
        findByCode: vi.fn(),
        update: vi.fn(),
      };

      await shortLinkService.createShortLink(shortLinkRepo, {
        destination: "https://example.com",
      });

      const { nanoid } = await import("nanoid");

      expect(nanoid).toHaveBeenCalled();
      expect(shortLinkRepo.createShortLink).toHaveBeenCalledWith({
        code: "random-alias",
        destination: "https://example.com",
        expiresAt: undefined,
      });
    });
  });

  describe("getByCode", () => {
    it("should throw error if code is not found", async () => {
      shortLinkRepo.findByCode = vi.fn().mockResolvedValue(null);

      await expect(
        shortLinkService.getShortLinkToRedirect(
          shortLinkRepo,
          "non-existent-code"
        )
      ).rejects.toBeInstanceOf(NotFoundError);
    });

    it("should throw error if short link has expired", async () => {
      shortLinkRepo.findByCode = vi.fn().mockResolvedValue({
        id: 1,
        code: "expired-code",
        destination: "https://example.com",
        createdAt: new Date(),
        expiresAt: fromZonedTime(new Date(Date.now() - 1000), "UTC"),
        clicks: 0,
      });

      await expect(
        shortLinkService.getShortLinkToRedirect(shortLinkRepo, "expired-code")
      ).rejects.toBeInstanceOf(BadRequestError);
    });

    it("should throw error if short link has reached max clicks", async () => {
      shortLinkRepo.findByCode = vi.fn().mockResolvedValue({
        id: 1,
        code: "max-clicks-code",
        destination: "https://example.com",
        createdAt: new Date(),
        maxClicks: 5,
        clicks: 5,
      });

      await expect(
        shortLinkService.getShortLinkToRedirect(
          shortLinkRepo,
          "max-clicks-code"
        )
      ).rejects.toBeInstanceOf(BadRequestError);
    });

    it("should increment clicks count on successful retrieval", async () => {
      shortLinkRepo.findByCode = vi.fn().mockResolvedValue({
        id: 1,
        code: "valid-code",
        destination: "https://example.com",
        createdAt: new Date(),
        clicks: 5,
      });

      await shortLinkService.getShortLinkToRedirect(
        shortLinkRepo,
        "valid-code"
      );

      expect(redis.get).toHaveBeenCalledWith("shortlink-clicks:valid-code");
      expect(redis.incr).toHaveBeenCalledWith("shortlink-clicks:valid-code");

      expect(incrementClickQueue.add).toHaveBeenCalledWith(
        "increment-click",
        expect.objectContaining({
          id: 1,
          code: "valid-code",
        })
      );
    });
  });
});
