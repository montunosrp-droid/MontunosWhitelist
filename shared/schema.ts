import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  discordId: text("discord_id").notNull().unique(),
  username: text("username").notNull(),
  discriminator: text("discriminator"),
  avatar: text("avatar"),
  email: text("email"),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type DiscordUser = {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  email?: string;
};

export type WhitelistEntry = {
  discordUsername: string;
  discordId?: string;
  email?: string;
  status: 'approved' | 'pending' | 'rejected';
  submittedAt?: string;
};

export type WhitelistCheckResult = {
  isWhitelisted: boolean;
  status?: 'approved' | 'pending' | 'rejected';
  matchedBy?: 'discordId' | 'username' | 'email';
  entry?: WhitelistEntry;
};
