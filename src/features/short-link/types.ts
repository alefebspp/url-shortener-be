export type CreateShortLinkPayload = {
  code: string;
  destination: string;
  customAlias?: string;
  title?: string;
  expiresAt?: Date;
  maxClicks?: number;
  clicks?: number;
  ownerId?: number;
};

export type CreateShortLinkServicePayload = Pick<
  CreateShortLinkPayload,
  "destination" | "customAlias" | "title" | "expiresAt" | "maxClicks"
>;

export type UpdateShortLinkPayload = Partial<CreateShortLinkPayload>;
