import type { Express } from "express";
import { createServer, type Server } from "http";
import passport from "passport";
import { googleSheetsService } from "./google-sheets";
import type { WhitelistCheckResult } from "@shared/schema";

function requireAuth(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "Not authenticated" });
}

// 🔥 Cooldown de 12 horas por Discord ID
const COOLDOWN_HOURS = 12;
const COOLDOWN_MS = COOLDOWN_HOURS * 60 * 60 * 1000;

// Guarda la última vez (timestamp) que cada usuario intentó WL
const lastAttemptById = new Map<string, number>();

// ====== Simple in-memory rate limit (protect OAuth endpoints) ======
const rlBucket = new Map<string, { count: number; resetAt: number }>();

function rateLimit(key: string, windowMs: number, max: number) {
  const now = Date.now();
  const entry = rlBucket.get(key);

  if (!entry || now > entry.resetAt) {
    rlBucket.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true as const };
  }

  entry.count += 1;
  if (entry.count > max) {
    const retryAfterMs = entry.resetAt - now;
    return { ok: false as const, retryAfterMs };
  }

  return { ok: true as const };
}

function oauthRateLimit(req: any, res: any, next: any) {
  const ip =
    req.headers["cf-connecting-ip"] ||
    req.headers["x-forwarded-for"] ||
    req.ip ||
    "unknown";
  const key = `${ip}:oauth`;
  const r = rateLimit(key, 60_000, 10); // 10/min por IP
  if (!r.ok) {
    const seconds = Math.ceil(r.retryAfterMs / 1000);
    return res.status(429).json({
      message: "Too many auth attempts. Please wait and try again.",
      retryAfterSeconds: seconds,
    });
  }
  next();
}


// IDs de tu servidor y rol de whitelist en Discord
const GUILD_ID = "1062848940711616594";
const WL_ROLE_ID = "1310428627271417897";

// 👇 Función que revisa si el usuario YA tiene el rol de whitelist en Discord
async function userHasWhitelistRole(user: any): Promise<boolean> {
  const accessToken = user?.accessToken as string | null;

  if (!accessToken) {
    console.warn("⚠️ No hay accessToken en req.user, no se puede comprobar rol WL");
    return false;
  }

  try {
    const resp = await fetch(
      `https://discord.com/api/v10/users/@me/guilds/${GUILD_ID}/member`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (resp.status === 404) {
      // No está en el servidor
      console.log("Usuario no está en el servidor, no tiene WL");
      return false;
    }

    if (!resp.ok) {
      console.error(
        "Error al obtener member desde Discord:",
        resp.status,
        await resp.text()
      );
      return false;
    }

    const data: any = await resp.json();
    const roles: string[] = Array.isArray(data.roles) ? data.roles : [];

    console.log("Roles del usuario:", roles);

    return roles.includes(WL_ROLE_ID);
  } catch (err) {
    console.error("Error llamando a la API de Discord para roles:", err);
    return false;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/auth/discord", oauthRateLimit, passport.authenticate("discord"));

  // CALLBACK DISCORD con:
  // 1) Chequeo de rol WL
  // 2) Cooldown 12h
  // 3) Formulario aleatorio
  // CALLBACK DISCORD con:
// 1) Chequeo de rol WL
// 2) Cooldown 12h
// 3) Formulario aleatorio
app.get("/api/auth/discord/callback", oauthRateLimit, (req, res, next) => {
  passport.authenticate("discord", (err: any, user: any, info: any) => {
    if (err) {
      console.error("===== DISCORD OAUTH ERROR =====");
      console.error(err);

      // Passport suele meter el detalle real aquí:
      if (err.oauthError) {
        console.error("oauthError.statusCode:", err.oauthError.statusCode);
        console.error("oauthError.data:", err.oauthError.data);
      }
      if (info) {
        console.error("info:", info);
      }

      return res.status(500).json({
        message: "Failed to obtain access token",
        statusCode: err.oauthError?.statusCode,
        data: err.oauthError?.data,
      });
    }

    if (!user) {
      return res.redirect("/?error=auth_failed");
    }

    req.logIn(user, async (loginErr: any) => {
      if (loginErr) {
        console.error("Login error:", loginErr);
        return res.redirect("/?error=login_failed");
      }

      try {
        const userId = req.user.discordId;
        const now = Date.now();

        // 1️⃣ Si ya tiene el rol WL, bloquear
        const alreadyWhitelisted = await checkUserHasRole(userId, WL_ROLE_ID);

        if (alreadyWhitelisted) {
          console.log(
            `✅ Usuario ${userId} ya tiene rol WL (${WL_ROLE_ID}). No puede postular.`
          );
          return res.redirect("/already-whitelisted");
        }

        // 2️⃣ Cooldown de 12 horas
        const lastAttempt = lastAttemptById.get(userId);

        if (lastAttempt && now - lastAttempt < COOLDOWN_MS) {
          const msLeft = COOLDOWN_MS - (now - lastAttempt);
          const hoursLeft = Math.ceil(msLeft / (1000 * 60 * 60));

          console.log(
            `⛔ Usuario ${userId} en cooldown. Horas restantes aproximadas: ${hoursLeft}`
          );

          // Redirige a la pantalla de cooldown en el FRONT
          return res.redirect(`/cooldown?left=${hoursLeft}`);
        }

        // Registrar nuevo intento (empieza/renueva cooldown)
        lastAttemptById.set(userId, now);

        // 3️⃣ Formularios disponibles (solo índice 1 ó 2)
        const forms = [{ id: "1" }, { id: "2" }];

        // Elegir formulario al azar
        const randomIndex = Math.floor(Math.random() * forms.length);
        const f = forms[randomIndex].id;

        console.log("Formulario seleccionado:", f, "Usuario:", userId);

        return res.redirect(`/auth/callback?f=${f}&id=${userId}`);
      } catch (e) {
        console.error("Error in Discord callback handler:", e);
        return res.redirect("/?error=callback_failed");
      }
    });
  })(req, res, next);
});


  // USER SESSION
  app.get("/api/auth/user", requireAuth, (req, res) => {
    res.json(req.user);
  });

  // LOGOUT
  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) return res.status(500).json({ error: "Logout failed" });
      req.session.destroy((err) => {
        if (err)
          return res
            .status(500)
            .json({ error: "Session destruction failed" });
        res.clearCookie("connect.sid");
        res.json({ success: true });
      });
    });
  });

  // WHITELIST CHECK (para tu dashboard)
  app.get("/api/whitelist/check", requireAuth, async (req, res) => {
    try {
      if (!req.user)
        return res.status(401).json({ error: "Not authenticated" });

      const result: WhitelistCheckResult = await googleSheetsService.checkWhitelist(
        req.user.discordId,
        req.user.username,
        req.user.email || undefined
      );

      res.json(result);
    } catch (error) {
      console.error("Error checking whitelist:", error);
      res.status(500).json({
        error: "Failed to check whitelist status",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}