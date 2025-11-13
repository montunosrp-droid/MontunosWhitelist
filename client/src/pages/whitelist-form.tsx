import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const TOTAL_TIME_SECONDS = 15 * 60; // 15 minutos

// Config de formularios (luego le metemos bien tus entry nuevos)
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

  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/user"],
  });

  // TIMER
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

  // URL pre-rellena (ID + nombre)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fParam = params.get("f") ?? "1";

    const config = FORMS[fParam as "1" | "2"] ?? FORMS["1"];

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
    setLocation("/");
  };

  const timeText =
    String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50 flex flex-col items-center p-4">
      <div className="w-full max-w-5xl space-y-5">
        {/* HEADER + TIMER */}
        <Card className="bg-slate-950/80 border border-orange-500/50 shadow-2xl">
          <CardContent className="py-4 px-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-xl md:text-2xl font-bold font-display text-white">
                Formulario de Whitelist – Montunos RP V2
              </h1>
              <p className="text-xs md:text-sm text-slate-300 mt-1">
                Tienes <span className="font-semibold text-orange-400">15 minutos</span>{" "}
                para completar el formulario. No cambies de pestaña, no recargues la
                página y no copies respuestas.
              </p>
            </div>

            <Card className={`w-full md:w-auto bg-slate-900/80 border ${isTimeOver ? "border-red-500/80" : "border-orange-400/80"}`}>
              <CardContent className="py-2 px-4 flex items-center gap-3">
                <div className="text-xs text-slate-300 uppercase tracking-wide">
                  Tiempo restante
                </div>
                <div
                  className={`text-lg font-mono font-semibold ${
                    isTimeOver ? "text-red-400" : "text-orange-400"
                  }`}
                >
                  {timeText}
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>

        {/* AVISO TIEMPO ACABADO */}
        {isTimeOver && (
          <Card className="bg-red-950/70 border border-red-500/70">
            <CardContent className="py-3 px-4 text-sm text-red-200">
              El tiempo ha finalizado. Si aún no enviaste el formulario, tus respuestas
              podrían no ser tomadas en cuenta.
            </CardContent>
          </Card>
        )}

        {/* FORMULARIO */}
        <Card className="overflow-hidden bg-slate-950/80 border border-slate-800 shadow-2xl">
          <CardHeader className="border-b border-slate-800">
            <CardTitle className="text-base md:text-lg text-slate-100">
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
              <div className="w-full h-full flex items-center justify-center text-sm text-slate-300">
                Cargando formulario...
              </div>
            )}
          </CardContent>
        </Card>

        {/* BOTÓN SALIR */}
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExit}
            className="text-slate-300 hover:text-white hover:bg-slate-800/80"
          >
            Salir
          </Button>
        </div>
      </div>
    </div>
  );
}
