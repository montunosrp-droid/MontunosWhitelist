import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DiscordIcon } from "@/components/discord-icon";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function Login() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("error")) {
      console.error("Authentication error:", params.get("error"));
    }
  }, []);

  const handleLogin = () => {
    window.location.href = "/api/auth/discord";
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-[#050608] via-[#111827] to-[#020308] text-slate-50 p-4">

      {/* Luces de fondo con tonos del logo */}
      <div className="absolute w-[420px] h-[420px] bg-orange-500/25 blur-[110px] rounded-full -top-32 -left-24" />
      <div className="absolute w-[360px] h-[360px] bg-slate-500/35 blur-[100px] rounded-full bottom-[-140px] right-[-80px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(248,250,252,0.05),_transparent_55%)] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Header con logo */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 w-24 h-24 rounded-full border-2 border-orange-500/80 bg-slate-900/80 flex items-center justify-center shadow-[0_0_40px_rgba(249,115,22,0.65)]">
            <img
              src="/montunos-logo.png"
              alt="Montunos RP V2"
              className="w-20 h-20 object-contain drop-shadow-[0_0_12px_rgba(0,0,0,0.8)]"
            />
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold tracking-wide font-display drop-shadow-lg">
            <span className="text-slate-50">Montunos</span>{" "}
            <span className="text-orange-400">Whitelist</span>
          </h1>

          <p className="text-sm md:text-base text-slate-300/80 mt-2">
            Verifica tu cuenta de Discord y revisa tu estado de whitelist en{" "}
            <span className="font-semibold text-orange-300">Montunos RP V2</span>.
          </p>
        </div>

        {/* Card principal */}
        <Card className="backdrop-blur-xl bg-slate-900/80 border border-orange-500/40 shadow-xl shadow-orange-500/20 rounded-2xl">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl font-bold text-slate-50">
              Bienvenido
            </CardTitle>
            <CardDescription className="text-base text-slate-300/80">
              Inicia sesión con Discord para comprobar tu whitelist.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <Button
              onClick={handleLogin}
              className="w-full h-12 text-base gap-3 bg-[#5865F2] hover:bg-[#4b55d8] text-white shadow-lg shadow-[#5865F2]/40 hover:shadow-[#5865F2]/60 border border-orange-400/60 transition-all"
              size="lg"
              data-testid="button-login-discord"
            >
              <DiscordIcon className="w-5 h-5" />
              Continuar con Discord
            </Button>

            <div className="text-center space-y-2 pt-2 border-t border-white/5">
              <p className="text-xs text-slate-300/75">
                Autenticación segura a través de Discord OAuth2.
              </p>
              <p className="text-xs text-slate-400/80">
                Solo accedemos a la información básica de tu perfil de Discord.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-xs md:text-sm text-slate-400/80">
          <p>
            ¿Problemas para entrar? Abre un ticket en el Discord oficial de{" "}
            <span className="text-orange-300 font-medium">Montunos RP</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
