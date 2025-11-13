import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import AuthCallback from "@/pages/auth-callback";
import Instructions from "@/pages/instructions";        // 👈 NUEVO
import WhitelistFormPage from "@/pages/whitelist-form"; // 👈 NUEVO
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      {/* Login principal */}
      <Route path="/" component={Login} />

      {/* Dashboard normal */}
      <Route path="/dashboard" component={Dashboard} />

      {/* Callback de Discord OAuth */}
      <Route path="/auth/callback" component={AuthCallback} />

      {/* NUEVA pantalla de instrucciones de whitelist */}
      <Route path="/instructions" component={Instructions} />

      {/* NUEVA pantalla de formulario con timer */}
      <Route path="/whitelist-form" component={WhitelistFormPage} />

      {/* 404 */}
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
