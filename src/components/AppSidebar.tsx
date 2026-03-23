import {
  LayoutDashboard,
  Shield,
  GitPullRequest,
  Settings,
  Search,
  FileText,
  Plug,
  HelpCircle,
  Network,
  LogOut,
  Brain,
} from "lucide-react";
import logoIcon from "@/assets/logo-icon.svg";
import { useLocation } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Sidebar,
  SidebarBody,
  SidebarLink,
  useSidebar,
} from "@/components/ui/aceternity-sidebar";
import { Link } from "react-router-dom";

const mainItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Assets", href: "/repos", icon: Network },
  { label: "Findings", icon: Shield, href: "/findings" },
  { label: "Exploit Paths", href: "/exploit-paths", icon: GitPullRequest },
  { label: "Threat Memory", href: "/threat-memory/repo-1", icon: Brain },
];

const bottomItems = [
  { label: "Settings", href: "/settings/profile", icon: Settings },
  { label: "Help", href: "/help", icon: HelpCircle },
];

import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function SidebarContent() {
  const { open } = useSidebar();
  const location = useLocation();
  const { user, signOut } = useAuth();

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + "/") || (path === "/settings/profile" && location.pathname.startsWith("/settings"));

  const mainLinks = mainItems.map((item) => ({
    label: item.label,
    href: item.href,
    icon: (
      <item.icon className="h-5 w-5 shrink-0 text-sidebar-foreground/70" />
    ),
  }));

  const bottomLinks = bottomItems.map((item) => ({
    label: item.label,
    href: item.href,
    icon: (
      <item.icon className="h-5 w-5 shrink-0 text-sidebar-foreground/70" />
    ),
  }));

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-4 pt-4 pb-6 px-3 shrink-0 border-b border-white/5 mx-2">
        <img
          src={logoIcon}
          alt="AART"
          className="w-7 h-7 group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]"
        />
        {open && (
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="font-brand text-2xl tracking-tighter text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] -mb-1"
          >
            aart
          </motion.span>
        )}
      </Link>

      {/* Main nav */}
      <div className="flex flex-col gap-1 mt-6 flex-1 px-2">
        {mainLinks.map((link, idx) => (
          <SidebarLink
            key={idx}
            link={link}
            active={isActive(link.href)}
            className={`transition-all duration-300 rounded-none ${isActive(link.href)
              ? "bg-white/5 border-l-2 border-primary text-white"
              : "hover:bg-white/[0.02] text-white/50 hover:text-white"
              }`}
          />
        ))}
      </div>

      {/* Bottom nav */}
      <div className="flex flex-col gap-1 border-t border-white/5 pt-4 pb-2 px-2 shrink-0">
        {bottomLinks.map((link, idx) => (
          <SidebarLink
            key={idx}
            link={link}
            active={isActive(link.href)}
            className={`transition-all duration-300 rounded-none overflow-hidden ${isActive(link.href)
              ? "bg-white/5 border-l-2 border-primary text-white"
              : "hover:bg-white/[0.02] text-white/50 hover:text-white"
              }`}
          />
        ))}
        
        {/* User Profile / Logout */}
        <div className="mt-4 border-t border-white/5 pt-4 mb-4">
          <div className="flex items-center gap-3 px-3 overflow-hidden">
            <Avatar className="h-8 w-8 rounded-lg border border-white/10 shrink-0">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-primary/20 text-primary text-[10px] uppercase font-mono">
                {user?.email?.substring(0, 2) || "OP"}
              </AvatarFallback>
            </Avatar>
            {open && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="flex flex-col truncate min-w-0"
              >
                <span className="text-[11px] font-mono text-white/80 truncate">
                  {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
                </span>
                <span className="text-[9px] font-mono text-white/30 truncate uppercase">
                  ACTIVE_SESSION
                </span>
              </motion.div>
            )}
            {open && (
              <button 
                onClick={() => signOut()}
                className="ml-auto p-1.5 hover:bg-white/5 rounded-md text-white/30 hover:text-red-400 transition-colors shrink-0"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          {!open && (
            <button 
              onClick={() => signOut()}
              className="mt-2 w-full flex justify-center py-2 hover:bg-white/5 text-white/30 hover:text-red-400 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function AppSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <Sidebar open={open} setOpen={setOpen}>
      <SidebarBody className="p-0 md:p-0 gap-0 border-r border-white/10 bg-black/95">
        <SidebarContent />
      </SidebarBody>
    </Sidebar>
  );
}
