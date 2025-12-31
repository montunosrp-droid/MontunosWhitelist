import dotenv from "dotenv";
dotenv.config();

import express from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as DiscordStrategy } from "passport-discord";
import fetch from "node-fetch";
import path from "path";

/* =========================
   CONFIG APP
========================= */

const app = express();
app.use((req, _res, next) => {
  if (req.path.startsWith("/api")) {
    console.log(`[REQ] ${req.method} ${req.path}`);
  }
  next();
});

app.set("trust proxy", 1);

/* =========================
   SESSION
========================= */

app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true,
      sameSite: "none",
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.get("/api/me", (req, res) => {
  const user = req.user as any;

  console.log("[/api/me] session user:", user ? user.id : "NO SESSION");

  if (!user || !user.id) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  return res.json({ id: user.id });
});

passport.serializeUser((user: any, done) => done(null, user));
passport.deserializeUser((obj: any, done) => done(null, obj));

/* =========================
   ENV CHECK
========================= */

const {
  DISCORD_CLIENT_ID,
  DISCORD_CLIENT_SECRET,
  DISCORD_REDIRECT_URI,
  DISCORD_BOT_TOKEN,
  DISCORD_GUILD_ID,
  DISCORD_WL_ROLE_ID,
} = process.env;

const missing = [
  !DISCORD_CLIENT_ID && "DISCORD_CLIENT_ID",
  !DISCORD_CLIENT_SECRET && "DISCORD_CLIENT_SECRET",
  !DISCORD_REDIRECT_URI && "DISCORD_REDIRECT_URI",
  !DISCORD_BOT_TOKEN && "DISCORD_BOT_TOKEN",
  !DISCORD_GUILD_ID && "DISCORD_GUILD_ID",
  !DISCORD_WL_ROLE_ID && "DISCORD_WL_ROLE_ID",
].filter(Boolean);

if (missing.length) {
  throw new Error(
    `Discord OAuth credentials not configured. Missing: ${missing.join(", ")}`
  );
}

/* =========================
   DISCORD STRATEGY
========================= */

passport.use(
  new DiscordStrategy(
    {
      clientID: DISCORD_CLIENT_ID!,
      clientSecret: DISCORD_CLIENT_SECRET!,
      callbackURL: DISCORD_REDIRECT_URI!,
      scope: ["identify"],
    },
    async (_accessToken, _refreshToken, profile, done) => {
      return done(null, profile);
    }
  )
);

/* =========================
   ROLE CHECK
========================= */

async function checkUserHasRole(discordId: string): Promise<boolean> {
  try {
    const res = await fetch(
      `https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/members/${discordId}`,
      {
        headers: {
          Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
        },
      }
    );

    if (!res.ok) {
      console.error("Failed to fetch guild member:", res.status);
      return false;
    }

    const member = await res.json();
    return Array.isArray(member.roles) && member.roles.includes(DISCORD_WL_ROLE_ID);
  } catch (err) {
    console.error("Role check error:", err);
    return false;
  }
}

/* =========================
   AUTH ROUTES
========================= */

app.get("/api/auth/discord", passport.authenticate("discord"));

app.get(
  "/api/auth/discord/callback",
  passport.authenticate("discord", { failureRedirect: "/cooldown" }),
  async (req, res) => {
    try {
      const user = req.user as any;
      const discordId = user.id;

      const hasRole = await checkUserHasRole(discordId);

      if (!hasRole) {
        return res.redirect("/cooldown");
      }

      return res.redirect("/instructions");
    } catch (err) {
      console.error("Error in Discord callback handler:", err);
      return res.redirect("/cooldown");
    }
  }
);

/* =========================
   STATIC FRONTEND (VITE)
========================= */

const publicPath = path.join(process.cwd(), "dist/public");
app.use(express.static(publicPath));

app.get("*", (_req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

/* =========================
   HEALTH
========================= */

app.get("/health", (_req, res) => {
  res.status(200).send("ok");
});

/* =========================
   START
========================= */

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`[express] serving on port ${PORT}`);
});
