import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function Instructions() {
  const [, setLocation] = useLocation();

  const handleStart = () => {
    // Ruta donde está tu formulario con timer
    setLocation("/whitelist-form");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-xl">
        <Card className="shadow-lg">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl font-display">
              Instrucciones para la Whitelist – Montunos RP V2
            </CardTitle>
            <CardDescription>
              Antes de iniciar el formulario, lee con atención las siguientes indicaciones.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 text-sm">
            <ul className="list-disc list-inside space-y-2 text-muted-foreground text-left">
              <li>
                Tendrás <strong>12 minutos</strong> para completar el formulario.
              </li>
              <li>
                <strong>No cambies de pestaña, no actualices la página y no copies respuestas.</strong>
              </li>
              <li>
                Formularios incompletos o con datos incorrectos serán <strong>rechazados</strong>.
              </li>
              <li>
                El Staff revisará tus respuestas y recibirás tu resultado por <strong>Discord</strong>.
              </li>
            </ul>

            <p className="text-muted-foreground text-sm pt-1">
              Cuando estés listo(a), podés comenzar. <br />
              <span className="font-semibold">Éxitos en tu postulación.</span>
            </p>

            <div className="pt-3">
              <Button
                onClick={handleStart}
                className="w-full h-11 text-base font-semibold"
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
