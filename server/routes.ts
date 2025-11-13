import type { Express } from "express";
import { createServer, type Server } from "http";
import passport from "passport";
import { googleSheetsService } from "./google-sheets";
import type { WhitelistCheckResult } from "@shared/schema";

function requireAuth(req: any, res: any, next: any) {
  if (req.isAuthenticated()) return next();
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
      if (!req.user) return res.redirect("/?error=no_user");

      // FORMULARIOS — SOLO DISCORD ID
      const forms = [
        {
          baseUrl:
            "https://docs.google.com/forms/d/e/1FAIpQLSdGJQRBMUi836oxKlSYwBKulZ2XsKdJXiFdpucCScRQUaI9YA/viewform",
          idField: "entry.196485464",
        },
        {
          baseUrl:
            "https://docs.google.com/forms/d/e/1FAIpQLSebFJ35j4b4cPDYos8Wx2NtmzCUsYTRT2Bg8nOgxQfEErQ4dg/viewform",
          idField: "entry.1991299365",
        },
      ];

      const randomIndex = Math.floor(Math.random() * forms.length);
      const f = String(randomIndex + 1);

      console.log("Formulario seleccionado:", f);

      // FRONTEND se encargará de meter el ID
      res.redirect(`/auth/callback?f=${f}`);
    }
  );

  app.get("/api/auth/user", requireAuth, (req, res) => {
    res.json(req.user);
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout(() => {
      req.session.destroy(() => {
        res.clearCookie("connect.sid");
        res.json({ success: true });
      });
    });
  });

  app.get("/api/whitelist/check", requireAuth, async (req, res) => {
    try {
      const result: WhitelistCheckResult = await googleSheetsService.checkWhitelist(
        req.user.discordId,
        req.user.username,
        req.user.email || undefined
      );

      res.json(result);
    } catch (error) {
      res.status(500).json({
        error: "Failed to check whitelist status",
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
