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
} from "lucide-react";
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
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Help", href: "/help", icon: HelpCircle },
];

function SidebarContent() {
  const { open } = useSidebar();
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

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
    <>
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 py-2 px-2 shrink-0">
        <div className="w-7 h-7 bg-primary rounded-sm shrink-0" />
        {open ? (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-heading font-bold text-lg tracking-tight text-sidebar-foreground whitespace-pre"
          >
            AART
          </motion.span>
        ) : (
          <div className="w-7 h-7 bg-primary rounded-sm shrink-0 hidden" />
        )}
      </Link>

      {/* Main nav */}
      <div className="flex flex-col gap-1 mt-8 flex-1">
        {mainLinks.map((link, idx) => (
          <SidebarLink
            key={idx}
            link={link}
            active={isActive(link.href)}
          />
        ))}
      </div>

      {/* Bottom nav */}
      <div className="flex flex-col gap-1 border-t border-sidebar-border pt-4">
        {bottomLinks.map((link, idx) => (
          <SidebarLink
            key={idx}
            link={link}
            active={isActive(link.href)}
          />
        ))}
      </div>
    </>
  );
}

export function AppSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <Sidebar open={open} setOpen={setOpen}>
      <SidebarBody className="justify-between gap-4">
        <SidebarContent />
      </SidebarBody>
    </Sidebar>
  );
}
