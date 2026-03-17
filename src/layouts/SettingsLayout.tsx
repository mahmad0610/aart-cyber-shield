import { Outlet, NavLink } from "react-router-dom";
import { User, Plug, Github, Bell, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { label: "Profile", href: "/settings/profile", icon: User },
  { label: "Repos", href: "/settings/repos", icon: Plug },
  { label: "GitHub App", href: "/settings/github-app", icon: Github },
  { label: "Notifications", href: "/settings/notifications", icon: Bell },
  { label: "Danger Zone", href: "/settings/danger", icon: AlertTriangle, isDanger: true },
];

const SettingsLayout = () => {
  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-white/5 px-10 md:px-16 pt-10">
        <h1 className="font-heading text-xl font-bold text-white uppercase italic tracking-widest mb-6">Settings_Console</h1>
        <nav className="flex gap-4">
          {tabs.map((tab) => (
            <NavLink
              key={tab.href}
              to={tab.href}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-6 py-3 font-mono text-[9px] font-bold uppercase tracking-[0.3em] border-b-2 -mb-px transition-all duration-300",
                  isActive
                    ? tab.isDanger
                      ? "border-red-500 text-red-500 bg-red-500/5 shadow-[inset_0_-10px_10px_-10px_rgba(239,68,68,0.2)]"
                      : "border-primary text-primary bg-primary/5 shadow-[inset_0_-10px_10px_-10px_rgba(125,131,250,0.2)]"
                    : tab.isDanger
                      ? "border-transparent text-red-500/50 hover:text-red-500 hover:border-red-500/20"
                      : "border-transparent text-white/30 hover:text-white hover:border-white/10"
                )
              }
            >
              <tab.icon className="h-3.5 w-3.5" />
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
