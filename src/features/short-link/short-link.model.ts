export interface ShortLink {
  id: number;
  code: string;
  destination: string;
  customAlias?: string | null;
  title?: string | null;
  createdAt: Date;
  expiresAt?: Date | null;
  maxClicks?: number | null;
  clicks?: number | null;
  ownerId?: number | null;
}
