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
import SettingsGithubApp from "./pages/SettingsGithubApp";
import SettingsNotifications from "./pages/SettingsNotifications";
import SettingsDanger from "./pages/SettingsDanger";
import ServerError from "./pages/ServerError";
import ConnectRepo from "./pages/onboarding/ConnectRepo";
import Scanning from "./pages/onboarding/Scanning";
import FirstFindings from "./pages/onboarding/FirstFindings";
import CleanRepo from "./pages/onboarding/CleanRepo";
import GithubAppInstall from "./pages/onboarding/GithubAppInstall";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AuthCallback from "./pages/AuthCallback";
import ForgotPassword from "./pages/ForgotPassword";
import { CornerHUD } from "@/components/CornerHUD";
import CyberCursor from "@/components/CyberCursor";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AuthProvider>
        <TooltipProvider>
          <CyberCursor />
          <CornerHUD />
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public landing */}
              <Route path="/" element={<Index />} />
              
              {/* Auth routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              
              {/* Onboarding flow — protected, no sidebar */}
              <Route path="/onboarding/connect" element={
                <ProtectedRoute>
                  <ConnectRepo />
                </ProtectedRoute>
              } />
              <Route path="/onboarding/scanning" element={
                <ProtectedRoute>
                  <Scanning />
                </ProtectedRoute>
              } />
              <Route path="/onboarding/findings" element={
                <ProtectedRoute>
                  <FirstFindings />
                </ProtectedRoute>
              } />
              <Route path="/onboarding/clean" element={
                <ProtectedRoute>
                  <CleanRepo />
                </ProtectedRoute>
              } />
              <Route path="/onboarding/github-app" element={
                <ProtectedRoute>
                  <GithubAppInstall />
                </ProtectedRoute>
              } />
              
              {/* Main App — protected, has sidebar */}
              <Route element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }>
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
                  <Route path="github-app" element={<SettingsGithubApp />} />
                  <Route path="notifications" element={<SettingsNotifications />} />
                  <Route path="danger" element={<SettingsDanger />} />
                </Route>
              </Route>
              
              <Route path="/500" element={<ServerError />} />
              {/* CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
