import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const TOTAL_TIME_SECONDS = 12 * 60; // 12 minutos

// Misma info de formularios que tenías en el server
const FORMS = {
  "1": {
    baseUrl:
      "https://docs.google.com/forms/d/e/1FAIpQLSdGJQRBMUi836oxKlSYwBKulZ2XsKdJXiFdpucCScRQUaI9YA/viewform",
    idField: "entry.196485464",
    nameField: "entry.2052814503",
  },
  "2": {
    baseUrl:
      "https://docs.google.com/forms/d/e/1FAIpQLSebFJ35j4b4cPDYos8Wx2NtmzCUsYTRT2Bg8nOgxQfEErQ4dg/viewform",
    idField: "entry.1991299365",
    nameField: "entry.1074312098",
  },
};

export default function WhitelistFormPage() {
  const [, setLocation] = useLocation();

  const [secondsLeft, setSecondsLeft] = useState(TOTAL_TIME_SECONDS);
  const [isTimeOver, setIsTimeOver] = useState(false);
  const [formUrl, setFormUrl] = useState<string>("");

  // Traemos los datos del usuario logueado
  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/user"],
  });

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsTimeOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Construir URL del formulario (con ID + nombre si tenemos user)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fParam = params.get("f") ?? "1";

    const config = FORMS[fParam as "1" | "2"] ?? FORMS["1"];

    // Si aún no hay user, mostramos el form sin pre-relleno
    if (!user) {
      setFormUrl(config.baseUrl);
      return;
    }

    const userId = encodeURIComponent(user.discordId);
    const userName = encodeURIComponent(user.username);

    const url = `${config.baseUrl}?usp=pp_url&${config.idField}=${userId}&${config.nameField}=${userName}`;

    setFormUrl(url);
  }, [user]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  const handleExit = () => {
    setLocation("/"); // o "/dashboard" si prefieres
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
              Tienes <strong>12 minutos</strong> para completar el formulario. No
              cambies de pestaña, no recargues la página y no copies respuestas.
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

        {/* Aviso cuando se acaba el tiempo */}
        {isTimeOver && (
          <Card className="border-destructive">
            <CardContent className="py-3 px-4 text-sm text-destructive">
              El tiempo ha finalizado. Si aún no enviaste el formulario, tus
              respuestas podrían no ser tomadas en cuenta. Por favor, envía lo que
              alcanzaste a responder.
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
            {formUrl ? (
              <iframe
                title="Whitelist Montunos RP V2"
                src={formUrl}
                className="w-full h-full border-0 rounded-md"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground">
                Cargando formulario...
              </div>
            )}
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
