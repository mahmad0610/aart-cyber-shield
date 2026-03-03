import { Outlet } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";

const DashboardLayout = () => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row w-full bg-background">
      <AppSidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
