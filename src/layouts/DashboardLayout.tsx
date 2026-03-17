import { Outlet } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";

const DashboardLayout = () => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row w-full bg-background relative overflow-hidden">
      {/* Global Background Elements */}
      <div className="absolute inset-0 pointer-events-none grid-overlay opacity-10 z-0" />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/[0.02] via-transparent to-transparent z-0" />

      <AppSidebar />
      <main className="flex-1 overflow-auto relative z-10 border-l border-white/5">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
