import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function CooldownPage() {
  const [, setLocation] = useLocation();
  const [hoursLeft, setHoursLeft] = useState<number | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const left = params.get("left");
    if (left) {
      setHoursLeft(Number(left));
    }
  }, []);

  const handleBack = () => {
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <Card className="bg-slate-950/90 border border-orange-500/60 shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-display text-orange-400">
              Cooldown activo ⏳
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4 text-center text-sm text-slate-200">
            <p>
              Ya enviaste una Whitelist recientemente.  
              Para evitar abuso del sistema debes esperar:
            </p>

            {hoursLeft !== null && (
              <p className="text-xl font-bold text-orange-400">
                {hoursLeft} hora{hoursLeft === 1 ? "" : "s"} restantes
              </p>
            )}

            <p className="text-xs text-slate-400">
              Si crees que esto es un error, contacta con el Staff.
            </p>

            <div className="pt-3">
              <Button
                onClick={handleBack}
                className="w-full h-10 text-sm font-semibold"
                variant="outline"
              >
                Volver al inicio
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
