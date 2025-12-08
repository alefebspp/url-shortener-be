import { integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

export const shortLinkTable = pgTable("short_links", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  code: varchar({ length: 255 }).notNull().unique(),
  destination: varchar().notNull(),
  title: varchar({ length: 255 }),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp({ withTimezone: true }),
  maxClicks: integer(),
  clicks: integer().notNull().default(0),
  ownerId: integer(),
});
