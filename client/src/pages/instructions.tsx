import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function Instructions() {
  const [, setLocation] = useLocation();

  const handleStart = () => {
    // Conservamos el query param ?f=1 o ?f=2 que vino desde el bot
    const search = window.location.search; // ej: ?f=1
    setLocation(`/whitelist-form${search}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-[#050608] via-[#111827] to-[#020308] text-slate-50 p-4">
      {/* Luces de fondo */}
      <div className="absolute w-[420px] h-[420px] bg-orange-500/25 blur-[110px] rounded-full -top-32 -left-24" />
      <div className="absolute w-[360px] h-[360px] bg-slate-500/35 blur-[100px] rounded-full bottom-[-140px] right-[-80px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(248,250,252,0.05),_transparent_55%)] pointer-events-none" />

      <div className="w-full max-w-xl relative z-10">
        <Card className="shadow-xl bg-slate-900/85 border border-orange-500/50 rounded-2xl overflow-hidden">
          <CardHeader className="space-y-4 pb-4">
            {/* Banner */}
            <div className="-mx-6 -mt-6 mb-2">
              <img
                src="/montunos-banner.png"
                alt="Montunos Roleplay"
                className="w-full h-32 object-cover md:h-36 border-b border-orange-500/50"
              />
            </div>

            <div className="text-center space-y-2">
              <CardTitle className="text-2xl font-display text-slate-50 drop-shadow">
                Instrucciones para la Whitelist – Montunos RP V2
              </CardTitle>
              <CardDescription className="text-slate-300/90">
                Antes de iniciar el formulario, lee con atención las siguientes indicaciones.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 text-sm">
            <ul className="list-disc list-inside space-y-2 text-slate-200 text-left">
              <li>
                Tendrás <strong className="text-orange-300">20 minutos</strong> para completar el formulario.
              </li>
              <li>
                <strong className="text-orange-300">
                  No cambies de pestaña, no actualices la página y no copies respuestas.
                </strong>
              </li>
              <li>
                Formularios incompletos o con datos incorrectos serán{" "}
                <strong className="text-orange-300">rechazados</strong>.
              </li>
              <li>
                El Staff revisará tus respuestas y recibirás tu resultado por{" "}
                <strong className="text-orange-300">Discord</strong>.
              </li>
            </ul>

            <p className="text-slate-300 text-sm pt-1">
              Cuando estés listo(a), podés comenzar. <br />
              <span className="font-semibold text-orange-300">
                Éxitos en tu postulación.
              </span>
            </p>

            <div className="pt-3">
              <Button
                onClick={handleStart}
                className="w-full h-11 text-base font-semibold bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/40"
              >
                Comenzar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
