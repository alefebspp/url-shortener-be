import type { ShortLink } from "../short-link.model";
import type { CreateShortLinkPayload, UpdateShortLinkPayload } from "../types";

export interface ShortLinkRepository {
  createShortLink: (data: CreateShortLinkPayload) => Promise<ShortLink>;
  findByCode: (code: string) => Promise<ShortLink | null>;
  update: (data: {
    id: number;
    data: UpdateShortLinkPayload;
  }) => Promise<ShortLink>;
}
