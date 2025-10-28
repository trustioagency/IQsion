import { Switch, Route } from "wouter";
import React, { Suspense, lazy } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import { LanguageProvider } from "./contexts/LanguageContext";
import { useAuth } from "./hooks/useAuth";
const Landing = lazy(() => import("./pages/landing"));
const Dashboard = lazy(() => import("./pages/dashboard"));
const MarketAnalysis = lazy(() => import("./pages/market-analysis"));
const CompetitorAnalysis = lazy(() => import("./pages/competitor-analysis"));
const Settings = lazy(() => import("./pages/settings"));
const NotFound = lazy(() => import("./pages/not-found"));
const Attribution = lazy(() => import("./pages/attribution"));
const Profitability = lazy(() => import("./pages/profitability"));
const Customers = lazy(() => import("./pages/customers"));
const Products = lazy(() => import("./pages/products"));
const Strategy = lazy(() => import("./pages/strategy"));
const Creative = lazy(() => import("./pages/creative"));
const Reports = lazy(() => import("./pages/reports"));
const Opportunities = lazy(() => import("./pages/opportunities"));
const Scenarios = lazy(() => import("./pages/scenarios"));
const KpiAnalysis = lazy(() => import("./pages/kpi-analysis"));
const TouchpointAnalysis = lazy(() => import("./pages/touchpoint-analysis"));
import Sidebar from "./components/layout/sidebar";
import Header from "./components/layout/header";

const Auth = lazy(() => import("./pages/auth"));
const Onboarding = lazy(() => import("./pages/onboarding"));
const Affiliate = lazy(() => import("./pages/affiliate"));
const Collaborations = lazy(() => import("./pages/collaborations"));
const Team = lazy(() => import("./pages/team"));
const Campaigns = lazy(() => import("./pages/campaigns"));
const AIAssistantPage = lazy(() => import("./pages/ai-assistant"));
const Autopilot = lazy(() => import("./pages/autopilot"));

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const isTestMode = typeof window !== "undefined" && window.location.search.includes("test=true");
  console.log('[App] Render, useAuth:', { isAuthenticated, isLoading, user });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated && !isTestMode) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center"><div className="text-white">Loading...</div></div>}>
        <Switch>
          <Route path="/" component={Landing} />
          <Route path="/auth" component={Auth} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    );
  }

  return (
    <div className="flex h-screen bg-slate-900 text-slate-300">
      <Sidebar />
      <div className="flex flex-col flex-1 w-full min-w-0 overflow-hidden">
  <Header />
        <main className="flex-1 overflow-y-auto bg-slate-800/50 p-6">
          <Suspense fallback={<div className="text-white">Loading...</div>}>
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
          </Suspense>
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