import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

const TOTAL_TIME_SECONDS = 12 * 60; // 12 minutos

export default function WhitelistFormPage() {
  const [, setLocation] = useLocation();
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_TIME_SECONDS);
  const [isTimeOver, setIsTimeOver] = useState(false);

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
    setLocation("/"); // o "/dashboard" si querés
  };

  return (
    <div className="min-h-screen bg-background p-4 flex flex-col items-center">
      <div className="w-full max-w-5xl space-y-4">
        {/* Header + Timer */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl md:text-2xl font-bold font-display">
              Formulario de Whitelist – Montunos RP V2
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground">
              Tienes <strong>12 minutos</strong> para completar el formulario. No cambies de
              pestaña, no recargues la página y no copies respuestas.
            </p>
          </div>

          <Card className={`w-full sm:w-auto ${isTimeOver ? "border-destructive" : ""}`}>
            <CardContent className="py-3 px-4 flex items-center gap-3">
              <div className="text-xs text-muted-foreground">Tiempo restante</div>
              <div
                className={`text-lg font-mono font-semibold ${
                  isTimeOver ? "text-destructive" : ""
                }`}
              >
                {String(minutes).padStart(2, "0")}:
                {String(seconds).padStart(2, "0")}
              </div>
            </CardContent>
          </Card>
        </div>

        {isTimeOver && (
          <Card className="border-destructive">
            <CardContent className="py-3 px-4 text-sm text-destructive">
              El tiempo ha finalizado. Si aún no enviaste el formulario, tus respuestas podrían
              no ser tomadas en cuenta. Por favor, envía lo que alcanzaste a responder.
            </CardContent>
          </Card>
        )}

        {/* Google Form */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base md:text-lg">
              Responde todas las preguntas con calma pero sin detenerte.
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[70vh]">
            <iframe
              title="Whitelist Montunos RP V2"
              src="https://docs.google.com/forms/d/TU_FORM_ID/viewform"
              className="w-full h-full border-0 rounded-md"
            />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={handleExit}>
            Salir
          </Button>
        </div>
      </div>
    </div>
  );
}
