import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { UserProfileCard } from "@/components/user-profile-card";
import { WhitelistStatusCard } from "@/components/whitelist-status-card";
import { LoadingSpinner } from "@/components/loading-spinner";
import { DiscordIcon } from "@/components/discord-icon";
import type { User, WhitelistCheckResult } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export default function Dashboard() {
  const [, setLocation] = useLocation();

  const { data: user, isLoading: userLoading, error: userError } = useQuery<User>({
    queryKey: ["/api/auth/user"],
  });

  const {
    data: whitelistResult,
    isLoading: whitelistLoading,
    error: whitelistError,
  } = useQuery<WhitelistCheckResult>({
    queryKey: ["/api/whitelist/check"],
    enabled: !!user,
  });

  useEffect(() => {
    if (!userLoading && (userError || !user)) {
      setLocation("/");
    }
  }, [userLoading, userError, user, setLocation]);

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout", {});
      setLocation("/");
    } catch (error) {
      console.error("Logout failed:", error);
      setLocation("/");
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-[#050608] via-[#111827] to-[#020308] text-slate-50">
        <div className="absolute w-[420px] h-[420px] bg-orange-500/25 blur-[110px] rounded-full -top-32 -left-24" />
        <div className="absolute w-[360px] h-[360px] bg-slate-500/35 blur-[100px] rounded-full bottom-[-140px] right-[-80px]" />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-full border-2 border-orange-500/80 bg-slate-900/80 flex items-center justify-center shadow-[0_0_40px_rgba(249,115,22,0.65)]">
            <img
              src="/montunos-logo.png"
              alt="Montunos RP V2"
              className="w-16 h-16 object-contain"
            />
          </div>
          <LoadingSpinner size="lg" text="Cargando tu perfil..." />
        </div>
      </div>
    );
  }

  if (userError || !user) {
    return null;
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#050608] via-[#111827] to-[#020308] text-slate-50">
      {/* Luces de fondo */}
      <div className="absolute w-[420px] h-[420px] bg-orange-500/25 blur-[110px] rounded-full -top-32 -left-24" />
      <div className="absolute w-[360px] h-[360px] bg-slate-500/35 blur-[100px] rounded-full bottom-[-140px] right-[-80px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(248,250,252,0.05),_transparent_55%)] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 border-b border-orange-500/40 bg-slate-900/70 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-full border-2 border-orange-500/80 bg-slate-900/90 shadow-[0_0_25px_rgba(249,115,22,0.7)]">
              <img
                src="/montunos-logo.png"
                alt="Montunos RP V2"
                className="w-10 h-10 object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold font-display tracking-wide">
                <span className="text-slate-50">Montunos</span>{" "}
                <span className="text-orange-400">Whitelist</span>
              </h1>
              <p className="text-xs md:text-sm text-slate-300/80">
                Discord Verification &amp; Whitelist Status
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-full border border-orange-400/70 bg-slate-900/80 px-3 py-1.5 text-xs md:text-sm text-slate-100 hover:bg-orange-500/80 hover:border-orange-400 shadow-md shadow-orange-500/30 transition-colors"
          >
            <DiscordIcon className="w-4 h-4" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          <div className="space-y-6">
            <div className="rounded-2xl bg-slate-900/80 border border-orange-500/30 shadow-lg shadow-orange-500/20 p-4">
              <UserProfileCard user={user} onLogout={handleLogout} />
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl bg-slate-900/80 border border-orange-500/30 shadow-lg shadow-orange-500/20 p-4">
              <WhitelistStatusCard
                result={whitelistResult}
                isLoading={whitelistLoading}
                error={whitelistError}
              />
            </div>
          </div>
        </div>

        <div className="mt-10 text-center text-sm text-slate-300/80">
          <p>
            Tu estado de whitelist se verifica contra las respuestas del formulario
            oficial de aplicación de{" "}
            <span className="text-orange-300 font-semibold">Montunos RP</span>.
          </p>
        </div>
      </main>
    </div>
  );
}

