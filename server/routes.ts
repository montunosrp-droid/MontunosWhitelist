import type { Express } from "express";
import { createServer, type Server } from "http";
import passport from "passport";
import rateLimit from "express-rate-limit";
import { googleSheetsService } from "./google-sheets";
import type { WhitelistCheckResult } from "@shared/schema";

function requireAuth(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "Not authenticated" });
}

// ====== CONFIG ======
// Cooldown por Discord ID (por defecto 12h)
const COOLDOWN_HOURS = Number(process.env.WL_COOLDOWN_HOURS ?? "12");
const COOLDOWN_MS = COOLDOWN_HOURS * 60 * 60 * 1000;

// Tiempo del intento (por defecto 25 min)
const ATTEMPT_MINUTES = Number(process.env.WL_ATTEMPT_MINUTES ?? "25");
const ATTEMPT_MS = ATTEMPT_MINUTES * 60 * 1000;

// Cooldown hasta (timestamp)
const cooldownUntilById = new Map<string, number>();

// Intento activo (para que el cooldown empiece cuando se termina el timer o se sale)
const activeAttemptById = new Map<string, { startedAt: number; formId: "1" | "2" }>();

// IDs de tu servidor y rol de whitelist en Discord
// (Los leemos desde ENV para que puedas mover el servicio sin tocar código)
const GUILD_ID =
  process.env.DISCORD_GUILD_ID ||
  process.env.DISCORD_GUILD ||
  "1062848940711616594";

const WL_ROLE_ID =
  process.env.DISCORD_WL_ROLE_ID ||
  process.env.DISCORD_WL_ROLE ||
  "1310428627271417897";

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
  // ====== RATE LIMIT (evita bucles y 429/1015) ======
  const authLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
  });

  const callbackLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.get("/api/auth/discord", authLimiter, passport.authenticate("discord"));

  // CALLBACK DISCORD con:
  // 1) Chequeo de rol WL
  // 2) Cooldown 12h
  // 3) Formulario aleatorio
  app.get(
    "/api/auth/discord/callback",
    callbackLimiter,
    passport.authenticate("discord", {
      failureRedirect: "/?error=auth_failed",
    }),
    async (req: any, res) => {
      if (!req.user) {
        return res.redirect("/?error=no_user");
      }

      const userId = String(req.user.discordId);
      const now = Date.now();

      // 1️⃣ Si YA tiene el rol de WL en tu servidor → mandarlo a already-whitelisted
      const alreadyHasWL = await userHasWhitelistRole(req.user);
      if (alreadyHasWL) {
        console.log(
          `✅ Usuario ${userId} ya tiene rol de WL, redirigiendo a /already-whitelisted`
        );
        return res.redirect("/already-whitelisted");
      }

      // 2️⃣ Cooldown: si ya está bloqueado, mandarlo al cooldown
      const cooldownUntil = cooldownUntilById.get(userId);
      if (cooldownUntil && now < cooldownUntil) {
        const msLeft = cooldownUntil - now;
        const hoursLeft = Math.ceil(msLeft / (1000 * 60 * 60));
        console.log(`⛔ Usuario ${userId} en cooldown. Horas restantes: ${hoursLeft}`);
        return res.redirect(`/cooldown?left=${hoursLeft}`);
      }

      // 3️⃣ Si ya tiene un intento activo dentro del tiempo, lo dejamos continuar (NO reinicia cooldown)
      const active = activeAttemptById.get(userId);
      if (active && now - active.startedAt < ATTEMPT_MS) {
        console.log(`↩️ Usuario ${userId} reanudando intento activo (form ${active.formId})`);
        return res.redirect(`/auth/callback?id=${userId}&f=${active.formId}&resume=1`);
      }

      // Si el intento activo ya expiró, lo cerramos y empezamos cooldown
      if (active && now - active.startedAt >= ATTEMPT_MS) {
        console.log(`⏱️ Intento expirado para ${userId}. Iniciando cooldown.`);
        activeAttemptById.delete(userId);
        cooldownUntilById.set(userId, now + COOLDOWN_MS);
        const hoursLeft = Math.ceil(COOLDOWN_MS / (1000 * 60 * 60));
        return res.redirect(`/cooldown?left=${hoursLeft}`);
      }

      // 4️⃣ OK: lo mandamos a la pantalla de instrucciones (sin empezar cooldown todavía)
      res.redirect(`/auth/callback?id=${userId}`);
    }
  );

  // ====== WHITELIST FLOW ======
  app.get("/api/whitelist/status", requireAuth, (req: any, res) => {
    const userId = String(req.user.discordId);
    const now = Date.now();

    const cooldownUntil = cooldownUntilById.get(userId) ?? 0;
    const active = activeAttemptById.get(userId);

    const cooldownMsLeft = Math.max(0, cooldownUntil - now);
    const attemptMsLeft = active ? Math.max(0, ATTEMPT_MS - (now - active.startedAt)) : 0;

    res.json({
      cooldownMsLeft,
      cooldownHoursLeft: cooldownMsLeft ? Math.ceil(cooldownMsLeft / (1000 * 60 * 60)) : 0,
      attemptMsLeft,
      attemptSecondsLeft: Math.ceil(attemptMsLeft / 1000),
      attemptMinutes: ATTEMPT_MINUTES,
      formId: active?.formId ?? null,
      startedAt: active?.startedAt ?? null,
    });
  });

  // Start attempt (se llama cuando le da "Comenzar")
  app.post("/api/whitelist/start", requireAuth, async (req: any, res) => {
    const userId = String(req.user.discordId);
    const now = Date.now();

    // Si ya tiene WL role, bloquear
    const alreadyHasWL = await userHasWhitelistRole(req.user);
    if (alreadyHasWL) {
      return res.status(409).json({ error: "already_whitelisted" });
    }

    const cooldownUntil = cooldownUntilById.get(userId);
    if (cooldownUntil && now < cooldownUntil) {
      const msLeft = cooldownUntil - now;
      return res.status(429).json({ error: "cooldown", hoursLeft: Math.ceil(msLeft / (1000 * 60 * 60)) });
    }

    const existing = activeAttemptById.get(userId);
    if (existing && now - existing.startedAt < ATTEMPT_MS) {
      return res.json({ ok: true, formId: existing.formId, startedAt: existing.startedAt, attemptMinutes: ATTEMPT_MINUTES });
    }

    // Crear intento nuevo
    const forms: Array<{ id: "1" | "2" }> = [{ id: "1" }, { id: "2" }];
    const randomIndex = Math.floor(Math.random() * forms.length);
    const formId = forms[randomIndex].id;

    activeAttemptById.set(userId, { startedAt: now, formId });

    return res.json({ ok: true, formId, startedAt: now, attemptMinutes: ATTEMPT_MINUTES });
  });

  // Finish attempt (timer termina o se sale)
  app.post("/api/whitelist/finish", requireAuth, (req: any, res) => {
    const userId = String(req.user.discordId);
    const now = Date.now();

    activeAttemptById.delete(userId);
    cooldownUntilById.set(userId, now + COOLDOWN_MS);

    return res.json({ ok: true, cooldownHours: COOLDOWN_HOURS });
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
