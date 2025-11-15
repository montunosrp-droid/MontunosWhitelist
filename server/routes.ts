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
  app.get("/api/auth/discord", passport.authenticate("discord"));

  // CALLBACK DISCORD con:
  // 1) Chequeo de rol WL
  // 2) Cooldown 12h
  // 3) Formulario aleatorio
  app.get(
    "/api/auth/discord/callback",
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

      // Mandamos también el ID en el query string
      res.redirect(`/auth/callback?f=${f}&id=${userId}`);
    }
  );

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
