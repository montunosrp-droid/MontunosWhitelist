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
    queryKey: ['/api/auth/user'],
  });

  const { data: whitelistResult, isLoading: whitelistLoading, error: whitelistError } = useQuery<WhitelistCheckResult>({
    queryKey: ['/api/whitelist/check'],
    enabled: !!user,
  });

  useEffect(() => {
    if (!userLoading && (userError || !user)) {
      setLocation('/');
    }
  }, [userLoading, userError, user, setLocation]);

  const handleLogout = async () => {
    try {
      await apiRequest('POST', '/api/auth/logout', {});
      setLocation('/');
    } catch (error) {
      console.error('Logout failed:', error);
      setLocation('/');
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" text="Loading your profile..." />
      </div>
    );
  }

  if (userError || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
              <DiscordIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-display">Montunos Whitelist</h1>
              <p className="text-xs text-muted-foreground">Discord Verification System</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          <div className="space-y-6">
            <UserProfileCard user={user} onLogout={handleLogout} />
          </div>
          
          <div className="space-y-6">
            <WhitelistStatusCard
              result={whitelistResult}
              isLoading={whitelistLoading}
              error={whitelistError}
            />
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            Your whitelist status is checked against the Montunos application form responses
          </p>
        </div>
      </main>
    </div>
  );
}
