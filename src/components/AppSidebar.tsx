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
  { label: "Findings", href: "/findings", icon: Shield },
  { label: "Exploit Paths", href: "/exploit-paths", icon: Network },
  { label: "Scans", href: "/scans", icon: Search },
  { label: "Pull Requests", href: "/pull-requests", icon: GitPullRequest },
  { label: "Repos", href: "/repos", icon: Plug },
  { label: "Reports", href: "/reports", icon: FileText },
];

const bottomItems = [
  { label: "Settings", href: "/settings/profile", icon: Settings },
  { label: "Help", href: "/help", icon: HelpCircle },
];

function SidebarContent() {
  const { open } = useSidebar();
  const location = useLocation();
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
