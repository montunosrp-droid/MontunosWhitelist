import { useEffect } from "react";
import { useLocation } from "wouter";
import { LoadingSpinner } from "@/components/loading-spinner";

export default function AuthCallback() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");

    if (error) {
      console.error("Authentication error:", error);
      setTimeout(() => setLocation("/?error=" + error), 2000);
    } else {
      const search = window.location.search; // conserva ?f=1 o ?f=2
      setTimeout(() => setLocation(`/instructions${search}`), 1000);
    }
  }, [setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" text="Completing authentication..." />
        <p className="text-sm text-muted-foreground">Please wait while we redirect you</p>
      </div>
    </div>
  );
}
