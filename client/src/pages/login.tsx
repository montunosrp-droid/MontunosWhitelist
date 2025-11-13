import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DiscordIcon } from "@/components/discord-icon";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function Login() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('error')) {
      console.error('Authentication error:', params.get('error'));
    }
  }, []);

  const handleLogin = () => {
    window.location.href = '/api/auth/discord';
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-[#0a0a0f] via-[#1c0f2e] to-[#0a0a0f] p-4 text-white">

      {/* Luces de fondo */}
      <div className="absolute w-[460px] h-[460px] bg-purple-600/30 blur-[110px] rounded-full -top-24 -left-24"></div>
      <div className="absolute w-[380px] h-[380px] bg-cyan-400/25 blur-[100px] rounded-full bottom-0 right-0"></div>

      <div className="w-full max-w-md relative z-10">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-[0_0_30px_rgba(139,92,246,0.6)] mb-5">
            <DiscordIcon className="w-10 h-10 text-white" />
          </div>

          <h1 className="text-4xl font-bold tracking-wide font-display drop-shadow-lg">
            Montunos Whitelist
          </h1>

          <p class_name="text-white/70 mt-2 text-base">
            Verifica tu estado de whitelist con tu cuenta de Discord
          </p>
        </div>

        {/* Card */}
        <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl rounded-xl">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl font-bold text-white">Bienvenido</CardTitle>
            <CardDescription className="text-base text-white/70">
              Inicia sesión para continuar
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <Button
              onClick={handleLogin}
              className="w-full h-12 text-base gap-3 bg-[#5865F2] hover:bg-[#4b55d8] text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transition-all"
              size="lg"
            >
              <DiscordIcon className="w-5 h-5" />
              Continuar con Discord
            </Button>

            <div className="text-center space-y-2 pt-2">
              <p className="text-xs text-white/60">
                Autenticación mediante Discord OAuth2
              </p>
              <p className="text-xs text-white/60">
                Solo usamos información básica de tu perfil
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-white/60">
          <p>¿Necesitas ayuda? Contacta al soporte de Montunos RP</p>
        </div>
      </div>

    </div>
  );
}
