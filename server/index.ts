import dotenv from "dotenv";
dotenv.config();

async function checkUserHasRole(discordId: string): Promise<boolean> {
  try {
    const botToken = process.env.DISCORD_BOT_TOKEN;
    const guildId = process.env.DISCORD_GUILD_ID;
    const roleId = process.env.DISCORD_WL_ROLE_ID;

    if (!botToken || !guildId || !roleId) {
      console.error("Missing Discord role check env vars");
      return false;
    }

    const response = await fetch(
      `https://discord.com/api/v10/guilds/${guildId}/members/${discordId}`,
      {
        headers: {
          Authorization: `Bot ${botToken}`,
        },
      }
    );

    if (!response.ok) {
      console.error("Failed to fetch guild member:", response.status);
      return false;
    }

    const member = await response.json();
    return Array.isArray(member.roles) && member.roles.includes(roleId);
  } catch (err) {
    console.error("Error checking user role:", err);
    return false;
  }
}

import express from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as DiscordStrategy } from "passport-discord";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

app.set("trust proxy", 1);

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

passport.serializeUser((user: any, done) => done(null, user));
passport.deserializeUser((obj: any, done) => done(null, obj));

const {
  DISCORD_CLIENT_ID,
  DISCORD_CLIENT_SECRET,
  DISCORD_REDIRECT_URI,
} = process.env;

if (!DISCORD_CLIENT_ID || !DISCORD_CLIENT_SECRET || !DISCORD_REDIRECT_URI) {
  throw new Error(
    `Discord OAuth credentials not configured. Missing: ${[
      !DISCORD_CLIENT_ID && "DISCORD_CLIENT_ID",
      !DISCORD_CLIENT_SECRET && "DISCORD_CLIENT_SECRET",
      !DISCORD_REDIRECT_URI && "DISCORD_REDIRECT_URI",
    ]
      .filter(Boolean)
      .join(", ")}`
  );
}

passport.use(
  new DiscordStrategy(
    {
      clientID: DISCORD_CLIENT_ID,
      clientSecret: DISCORD_CLIENT_SECRET,
      callbackURL: DISCORD_REDIRECT_URI,
      scope: ["identify"],
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        return done(null, profile);
      } catch (err) {
        return done(err as Error);
      }
    }
  )
);

app.get("/api/auth/discord", passport.authenticate("discord"));

app.get(
  "/api/auth/discord/callback",
  passport.authenticate("discord", { failureRedirect: "/error=callback_failed" }),
  async (req, res) => {
    try {
      const user = req.user as any;
      const discordId = user.id;

      const hasRole = await checkUserHasRole(discordId);

      if (!hasRole) {
        return res.redirect("/no-whitelist");
      }

      // ✅ IMPORTANTE: primero instrucciones, NO form directo
      return res.redirect("/instructions");
    } catch (err) {
      console.error("Error in Discord callback handler:", err);
      return res.redirect("/error=callback_failed");
    }
  }
);

// Health check para Render y UptimeRobot
app.get("/health", (_req, res) => {
  res.status(200).send("ok");
});

// ✅ SERVIR FRONTEND (evita "Cannot GET /")
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// En build, Vite deja el frontend en: dist/public
const publicDir = path.join(__dirname, "public");
app.use(express.static(publicDir));

// Fallback SPA: cualquier ruta que NO sea /api ni /health carga index.html
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) return next();
  if (req.path === "/health") return next();
  res.sendFile(path.join(publicDir, "index.html"));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`[express] serving on port ${PORT}`);
});
