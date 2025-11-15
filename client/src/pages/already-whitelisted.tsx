import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AlreadyWhitelistedPage() {
  const [, setLocation] = useLocation();

  const handleBack = () => {
    setLocation("/"); // Te regresa al login/inicio
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <Card className="bg-slate-950/90 border border-emerald-500/60 shadow-2xl">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl font-display text-emerald-400">
              Ya tienes Whitelist ✅
            </CardTitle>
            <p className="text-xs text-slate-400 uppercase tracking-wide">
              Montunos RP V2 · Sistema de Verificación
            </p>
          </CardHeader>

          <CardContent className="space-y-4 text-center text-sm text-slate-200">
            <p>
              Tu usuario ya cuenta con <span className="font-semibold">Whitelist aprobada</span> 
              {" "}en <span className="font-semibold">Montunos RP V2</span>.
            </p>

            <p>
              No es necesario que vuelvas a completar el formulario.  
              Si sigues teniendo problemas para ingresar al servidor, comunícate con el Staff.
            </p>

            <p className="text-xs text-slate-400">
              Si consideras que esto es un error, abre un ticket en Discord e incluye tu{" "}
              <span className="font-semibold text-emerald-300">ID de Discord</span> para que puedan revisarlo.
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
