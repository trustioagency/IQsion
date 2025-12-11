import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import { LanguageProvider } from "./contexts/LanguageContext";
import { useAuth } from "./hooks/useAuth";
import Landing from "./pages/landing";
import Dashboard from "./pages/dashboard";
import MarketAnalysis from "./pages/market-analysis";
import CompetitorAnalysis from "./pages/competitor-analysis";
import Settings from "./pages/settings";
import NotFound from "./pages/not-found";
import Attribution from "./pages/attribution";
import Profitability from "./pages/profitability";
import Customers from "./pages/customers";
import Products from "./pages/products";
import Strategy from "./pages/strategy";
import Creative from "./pages/creative";
import Reports from "./pages/reports";
import Opportunities from "./pages/opportunities";
import Scenarios from "./pages/scenarios";
import KpiAnalysis from "./pages/kpi-analysis";
import TouchpointAnalysis from "./pages/touchpoint-analysis";
import Sidebar from "./components/layout/sidebar";
import Header from "./components/layout/header";

import Auth from "./pages/auth";
import Onboarding from "./pages/onboarding";
import Affiliate from "./pages/affiliate";
import Collaborations from "./pages/collaborations";
import Team from "./pages/team";
import Campaigns from "./pages/campaigns";
import AIAssistantPage from "./pages/ai-assistant";
import Autopilot from "./pages/autopilot";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();
  console.log('[App] Render, useAuth:', { isAuthenticated, isLoading, user });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/auth" component={Auth} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  return (
    <div className="flex h-screen bg-slate-900 text-slate-300">
      <Sidebar />
      <div className="flex flex-col flex-1 w-full min-w-0 overflow-hidden">
        <Header currentPage="Dashboard" />
        <main className="flex-1 overflow-y-auto bg-slate-800/50 p-6">
          <Switch>
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/" component={Dashboard} />
            <Route path="/market-analysis" component={MarketAnalysis} />
            <Route path="/competitor-analysis" component={CompetitorAnalysis} />
            <Route path="/attribution" component={Attribution} />
            <Route path="/profitability" component={Profitability} />
            <Route path="/kpi-analysis" component={KpiAnalysis} />
            <Route path="/touchpoint-analysis" component={TouchpointAnalysis} />

            <Route path="/collaborations/affiliate" component={Affiliate} />
            <Route path="/customers" component={Customers} />
            <Route path="/products" component={Products} />
            <Route path="/campaigns" component={Campaigns} />
            <Route path="/collaborations" component={Collaborations} />
            <Route path="/strategy" component={Strategy} />
            <Route path="/creative" component={Creative} />
            <Route path="/reports" component={Reports} />
            <Route path="/opportunities" component={Opportunities} />
            <Route path="/scenarios" component={Scenarios} />
            <Route path="/ai-assistant" component={AIAssistantPage} />
            <Route path="/autopilot" component={Autopilot} />
            <Route path="/team" component={Team} />
            <Route path="/settings" component={Settings} />
            <Route path="/onboarding" component={Onboarding} />
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;