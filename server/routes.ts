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

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/auth/discord", passport.authenticate("discord"));

  // CALLBACK DISCORD con cooldown
  app.get(
    "/api/auth/discord/callback",
    passport.authenticate("discord", {
      failureRedirect: "/?error=auth_failed",
    }),
    (req, res) => {
      if (!req.user) {
        return res.redirect("/?error=no_user");
      }

      const userId = String(req.user.discordId);
      const now = Date.now();
      const lastAttempt = lastAttemptById.get(userId);

      // ⏳ Verificar cooldown de 12 horas
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

      // Formularios disponibles (solo índice 1 ó 2)
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
        if (err) return res.status(500).json({ error: "Session destruction failed" });
        res.clearCookie("connect.sid");
        res.json({ success: true });
      });
    });
  });

  // WHITELIST CHECK
  app.get("/api/whitelist/check", requireAuth, async (req, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Not authenticated" });

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
