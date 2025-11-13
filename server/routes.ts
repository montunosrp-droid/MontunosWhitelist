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

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/auth/discord", passport.authenticate("discord"));

  // CALLBACK
  app.get(
    "/api/auth/discord/callback",
    passport.authenticate("discord", {
      failureRedirect: "/?error=auth_failed",
    }),
    (req, res) => {
      if (!req.user) {
        return res.redirect("/?error=no_user");
      }

      // ---- FORMULARIOS DISPONIBLES ----
      const forms = [
        { id: "1" },
        { id: "2" }
      ];

      // ---- Elegir al azar ----
      const randomIndex = Math.floor(Math.random() * forms.length);
      const f = forms[randomIndex].id;

      console.log("Formulario seleccionado:", f);

      // 🔥 Redirige al frontend SOLO con el número de formulario
      res.redirect(`/auth/callback?f=${f}`);
    }
  );

  // ---- USER SESSION ----
  app.get("/api/auth/user", requireAuth, (req, res) => {
    res.json(req.user);
  });

  // ---- LOGOUT ----
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

  // ---- WHITELIST CHECK ----
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
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
