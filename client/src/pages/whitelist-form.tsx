import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

const TOTAL_TIME_SECONDS = 12 * 60; // 12 minutos

// Función que decide qué URL de Google Form usar según el parámetro ?f=
function getFormUrlFromQuery(): string {
  const params = new URLSearchParams(window.location.search);
  const formId = params.get("f") ?? "1"; // por defecto 1 si no viene nada

  if (formId === "2") {
    // Segundo formulario
    return "https://docs.google.com/forms/d/e/1FAIpQLSebFJ35j4b4cPDYos8Wx2NtmzCUsYTRT2Bg8nOgxQfEErQ4dg/viewform?usp=dialog";
  }

  // Primer formulario
  return "https://docs.google.com/forms/d/e/1FAIpQLSdGJQRBMUi836oxKlSYwBKulZ2XsKdJXiFdpucCScRQUaI9YA/viewform?usp=dialog";
}

export default function WhitelistFormPage() {
  const [, setLocation] = useLocation();
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_TIME_SECONDS);
  const [isTimeOver, setIsTimeOver] = useState(false);

  const formUrl = getFormUrlFromQuery();

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsTimeOver(true);
          // No auto-submit porque es Google Form
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  const handleExit = () => {
    setLocation("/"); // o "/dashboard" si preferís
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#050608] via-[#111827] to-[#020308] text-slate-50 p-4 flex flex-col items-center">
      {/* Luces de fondo */}
      <div className="absolute w-[420px] h-[420px] bg-orange-500/25 blur-[110px] rounded-full -top-32 -left-24" />
      <div className="absolute w-[360px] h-[360px] bg-slate-500/35 blur-[100px] rounded-full bottom-[-140px] right-[-80px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(248,250,252,0.05),_transparent_55%)] pointer-events-none" />

      <div className="w-full max-w-5xl space-y-4 relative z-10">
        {/* Banner arriba */}
        <div className="rounded-2xl overflow-hidden border border-orange-500/60 bg-slate-900/80 shadow-[0_0_30px_rgba(249,115,22,0.5)]">
          <img
            src="/montunos-banner.png"
            alt="Montunos Roleplay"
            className="w-full h-32 md:h-36 object-cover border-b border-orange-500/60"
          />
        </div>

        {/* Header + Timer */}
        <div className="flex items-center justify-between gap-4 flex-wrap mt-2">
          <div className="space-y-1">
            <h1 className="text-xl md:text-2xl font-bold font-display text-slate-50 drop-shadow">
              Formulario de Whitelist – Montunos RP V2
            </h1>
            <p className="text-xs md:text-sm text-slate-300/90">
              Tienes <span className="font-semibold text-orange-300">12 minutos</span> para completar el formulario. 
              No cambies de pestaña, no recargues la página y no copies respuestas.
            </p>
          </div>

          <Card
            className={`w-full sm:w-auto bg-slate-900/90 border ${
              isTimeOver ? "border-red-500/80" : "border-orange-500/80"
            } shadow-lg shadow-orange-500/40`}
          >
            <CardContent className="py-3 px-4 flex items-center gap-3">
              <div className="text-xs text-slate-300/90">Tiempo restante</div>
              <div
                className={`text-lg font-mono font-semibold ${
                  isTimeOver ? "text-red-400" : "text-orange-300"
                }`}
              >
                {String(minutes).padStart(2, "0")}:
                {String(seconds).padStart(2, "0")}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Aviso cuando se acaba el tiempo */}
        {isTimeOver && (
          <Card className="border-red-500/80 bg-red-950/60">
            <CardContent className="py-3 px-4 text-sm text-red-200">
              El tiempo ha finalizado. Si aún no enviaste el formulario, tus respuestas podrían
              no ser tomadas en cuenta. Por favor, envía lo que alcanzaste a responder.
            </CardContent>
          </Card>
        )}

        {/* Google Form */}
        <Card className="overflow-hidden bg-slate-900/85 border border-orange-500/60 rounded-2xl shadow-lg shadow-orange-500/30">
          <CardHeader>
            <CardTitle className="text-base md:text-lg text-slate-50">
              Responde todas las preguntas con calma pero sin detenerte.
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[70vh]">
            <iframe
              title="Whitelist Montunos RP V2"
              src={formUrl}
              className="w-full h-full border-0 rounded-md bg-slate-950"
            />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExit}
            className="text-slate-200 hover:text-white hover:bg-orange-500/80 hover:border-orange-400 border border-transparent"
          >
            Salir
          </Button>
        </div>
      </div>
    </div>
  );
}

