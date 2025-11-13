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

app.get(
  "/api/auth/discord/callback",
  passport.authenticate("discord", {
    failureRedirect: "/?error=auth_failed",
  }),
  (req, res) => {
    const forms = [
      "https://docs.google.com/forms/d/e/1FAIpQLSdGJQRBMUi836oxKlSYwBKulZ2XsKdJXiFdpucCScRQUaI9YA/viewform?usp=dialog",
      "https://docs.google.com/forms/d/e/1FAIpQLSebFJ35j4b4cPDYos8Wx2NtmzCUsYTRT2Bg8nOgxQfEErQ4dg/viewform?usp=dialog"
    ];

    const randomIndex = Math.floor(Math.random() * forms.length);
    const chosenForm = forms[randomIndex];

    console.log("Redirigiendo al formulario:", chosenForm);

    res.redirect(chosenForm);
  }
);

  app.get("/api/auth/user", requireAuth, (req, res) => {
    res.json(req.user);
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ error: "Session destruction failed" });
        }
        res.clearCookie("connect.sid");
        res.json({ success: true });
      });
    });
  });

  app.get("/api/whitelist/check", requireAuth, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }

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
