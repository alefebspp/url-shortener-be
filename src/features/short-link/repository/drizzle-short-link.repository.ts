import { eq } from "drizzle-orm";

import type { CreateShortLinkPayload, UpdateShortLinkPayload } from "../types";

import { db } from "@/db";
import { shortLinkTable } from "@/db/schema/short-link";
import type { ShortLink } from "../short-link.model";

export async function createShortLink(data: CreateShortLinkPayload) {
  const rows = await db.insert(shortLinkTable).values(data).returning();

  return rows[0] as ShortLink;
}

export async function findByCode(code: string) {
  const row = await db
    .select()
    .from(shortLinkTable)
    .where(eq(shortLinkTable.code, code))
    .limit(1);

  return row[0] ?? null;
}

export async function update({
  id,
  data,
}: {
  id: number;
  data: UpdateShortLinkPayload;
}) {
  const rows = await db
    .update(shortLinkTable)
    .set(data)
    .where(eq(shortLinkTable.id, id))
    .returning();

  return rows[0] as ShortLink;
}
