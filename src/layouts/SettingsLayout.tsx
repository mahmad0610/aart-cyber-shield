import { Outlet, NavLink } from "react-router-dom";
import { User, Plug } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { label: "Profile", href: "/settings/profile", icon: User },
  { label: "Repos", href: "/settings/repos", icon: Plug },
];

const SettingsLayout = () => {
  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-border px-6 md:px-10 pt-6">
        <h1 className="text-xl font-heading font-bold text-foreground mb-4">Settings</h1>
        <nav className="flex gap-1">
          {tabs.map((tab) => (
            <NavLink
              key={tab.href}
              to={tab.href}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )
              }
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </NavLink>
          ))}
        </nav>
      </div>
      <Outlet />
    </div>
  );
};

export default SettingsLayout;
