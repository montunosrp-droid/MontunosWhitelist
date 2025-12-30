import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function AlreadyWhitelisted() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50 p-4">
      <div className="w-full max-w-lg">

        {/* LOGO CENTRADO */}
        <div className="flex justify-center mb-4">
          <img
            src="/montunos-logo.png" 
            alt="Montunos Logo"
            className="w-20 h-20 drop-shadow-[0_0_10px_rgba(255,140,0,0.6)]"
          />
        </div>

        <Card className="bg-slate-950/90 border border-orange-500/60 shadow-2xl">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-3xl font-display text-orange-400">
              ¿Y vos qué hacés aquí? 😏
            </CardTitle>
            <p className="text-sm text-slate-400">
              Montunos RP V2 · Sistema de Whitelist
            </p>
          </CardHeader>

          <CardContent className="space-y-5 text-center text-slate-200">
            
            <p className="text-lg font-semibold text-orange-300">
              ¡Si vos YA TENÉS WHITELIST! 
            </p>

            <p>
              Andás queriendo hacer otra WL o que onda, ya su WL esta 
              <span className="font-semibold text-orange-400">
                APROBADA
              </span>.
            </p>


            <Button
              className="w-full bg-orange-500 hover:bg-orange-600 text-slate-950 font-semibold mt-4"
              onClick={() => setLocation("/dashboard")}
            >
              VOLVER AL PANEL
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
