import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import AuthCallback from "@/pages/auth-callback";
import Instructions from "@/pages/instructions";
import WhitelistFormPage from "@/pages/whitelist-form";
import CooldownPage from "@/pages/cooldown";
import AlreadyWhitelistedPage from "@/pages/already-whitelisted"; // 👈 NUEVO
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/auth/callback" component={AuthCallback} />

      {/* Rutas del flujo de whitelist */}
      <Route path="/instructions" component={Instructions} />
      <Route path="/whitelist-form" component={WhitelistFormPage} />
      <Route path="/cooldown" component={CooldownPage} />
      <Route path="/already-whitelisted" component={AlreadyWhitelistedPage} /> {/* 👈 NUEVA RUTA */}

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
