import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Repos from "./pages/Repos";
import RepoDetail from "./pages/RepoDetail";
import Findings from "./pages/Findings";
import FindingDetail from "./pages/FindingDetail";
import ExploitPaths from "./pages/ExploitPaths";
import ThreatMemory from "./pages/ThreatMemory";
import ScanHistory from "./pages/ScanHistory";
import Demo from "./pages/Demo";
import SettingsLayout from "./layouts/SettingsLayout";
import SettingsProfile from "./pages/SettingsProfile";
import SettingsRepos from "./pages/SettingsRepos";
import EvervaultDemo from "./pages/EvervaultDemo";
import DottedDemo from "./pages/DottedDemo";
import { ThemeProvider } from "@/components/theme-provider";

import { CornerHUD } from "@/components/CornerHUD";
import CyberCursor from "@/components/CyberCursor";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <TooltipProvider>
        <CyberCursor />
        <CornerHUD />
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/repos" element={<Repos />} />
              <Route path="/repos/:repoId" element={<RepoDetail />} />
              <Route path="/findings" element={<Findings />} />
              <Route path="/findings/:findingId" element={<FindingDetail />} />
              <Route path="/exploit-paths" element={<ExploitPaths />} />
              <Route path="/threat-memory/:repoId" element={<ThreatMemory />} />
              <Route path="/repos/:repoId/scans" element={<ScanHistory />} />
              <Route path="/settings" element={<SettingsLayout />}>
                <Route index element={<SettingsProfile />} />
                <Route path="profile" element={<SettingsProfile />} />
                <Route path="repos" element={<SettingsRepos />} />
              </Route>
            </Route>
            <Route path="/demo" element={<Demo />} />
            <Route path="/evervault-demo" element={<EvervaultDemo />} />
            <Route path="/dotted-demo" element={<DottedDemo />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
