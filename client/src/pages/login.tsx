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
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <DiscordIcon className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold font-display mb-2">Montunos Whitelist</h1>
          <p className="text-muted-foreground">
            Verify your Discord account status
          </p>
        </div>

        <Card className="shadow-lg" data-testid="card-login">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl font-display">Welcome</CardTitle>
            <CardDescription className="text-base">
              Sign in with Discord to check your whitelist status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleLogin}
              className="w-full h-12 text-base gap-3"
              size="lg"
              data-testid="button-login-discord"
            >
              <DiscordIcon className="w-5 h-5" />
              Continue with Discord
            </Button>

            <div className="text-center space-y-2 pt-2">
              <p className="text-xs text-muted-foreground">
                By continuing, you agree to authenticate via Discord OAuth2
              </p>
              <p className="text-xs text-muted-foreground">
                We only access your basic Discord profile information
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-sm text-muted-foreground">
          <p>Need help? Contact support for assistance</p>
        </div>
      </div>
    </div>
  );
}
