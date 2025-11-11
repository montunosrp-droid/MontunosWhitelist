import passport from "passport";
import { Strategy as DiscordStrategy } from "passport-discord";
import type { Express } from "express";
import { storage } from "./storage";
import type { User, InsertUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends User {}
  }
}

export function setupAuth(app: Express) {
  if (!process.env.DISCORD_CLIENT_ID || !process.env.DISCORD_CLIENT_SECRET || !process.env.DISCORD_REDIRECT_URI) {
    throw new Error("Discord OAuth credentials not configured");
  }

  passport.use(
    new DiscordStrategy(
      {
        clientID: process.env.DISCORD_CLIENT_ID,
        clientSecret: process.env.DISCORD_CLIENT_SECRET,
        callbackURL: process.env.DISCORD_REDIRECT_URI,
        scope: ["identify", "email"],
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          let user = await storage.getUserByDiscordId(profile.id);

          const userData: InsertUser = {
            discordId: profile.id,
            username: profile.username,
            discriminator: profile.discriminator,
            avatar: profile.avatar,
            email: profile.email,
            accessToken: _accessToken,
            refreshToken: _refreshToken,
          };

          if (user) {
            user = await storage.updateUser(user.id, userData);
          } else {
            user = await storage.createUser(userData);
          }

          if (!user) {
            return done(new Error("Failed to create or update user"));
          }

          return done(null, user);
        } catch (error) {
          return done(error as Error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user || null);
    } catch (error) {
      done(error);
    }
  });

  app.use(passport.initialize());
  app.use(passport.session());
}
