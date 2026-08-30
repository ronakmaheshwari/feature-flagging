"use client";

import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Flag,
  Users,
  GitBranch,
  FileText,
  History,
  Settings,
  ChevronLeft,
  ChevronRight,
  BarChart2,
  User,
  LogOut,
  Badge as BadgeIcon,
  X,
} from "lucide-react";
import { useAuth } from "@/components/custom/authContext";
import { Badge } from "@/components/ui/badge";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["USER", "ADMIN"] as const },
  { name: "Feature Flags", href: "/dashboard/flags", icon: Flag, roles: ["USER", "ADMIN"] as const },
  { name: "My Content", href: "/dashboard/content", icon: FileText, roles: ["USER", "ADMIN"] as const },
  { name: "Groups", href: "/dashboard/groups", icon: Users, roles: ["ADMIN"] as const },
  { name: "Route Flags", href: "/dashboard/route-flags", icon: GitBranch, roles: ["ADMIN"] as const },
  { name: "Audit Logs", href: "/dashboard/audit", icon: History, roles: ["ADMIN"] as const },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart2, roles: ["ADMIN"] as const },
  { name: "Settings", href: "/dashboard/settings", icon: Settings, roles: ["USER", "ADMIN"] as const },
];

type SidebarProps = {
  mobileOpen: boolean;
  onMobileClose: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
};

export function Sidebar({ mobileOpen, onMobileClose, collapsed, onToggleCollapse }: SidebarProps) {
  const { user, role, logout } = useAuth();
  const location = useLocation();

  const filteredNav = navigation.filter((item) =>
    role ? (item.roles as readonly ("USER" | "ADMIN")[]).includes(role) : false
  );

  const NavContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <>
      <div className="flex h-16 items-center justify-between gap-2 border-b border-border px-3 shrink-0">
        {(!collapsed || isMobile) ? (
          <NavLink to="/dashboard" className="flex items-center gap-2 min-w-0" onClick={isMobile ? onMobileClose : undefined}>
            <BadgeIcon className="size-5 text-primary shrink-0" />
            <span className="font-mono font-bold text-lg truncate">FlagOps</span>
          </NavLink>
        ) : (
          <div className="flex-1 flex justify-center">
            <BadgeIcon className="size-5 text-primary" />
          </div>
        )}

        {/* Desktop collapse button */}
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="h-8 w-8 shrink-0 hidden lg:inline-flex"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
          </Button>
        )}

        {/* Mobile close */}
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={onMobileClose} className="h-8 w-8 shrink-0" aria-label="Close sidebar">
            <X className="size-4" />
          </Button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1" role="navigation" aria-label="Main navigation">
        {filteredNav.map((item) => {
          const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + "/");
          return (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={isMobile ? onMobileClose : undefined}
              className={cn(
                "flex items-center gap-3 rounded-none px-3 py-2 text-xs font-medium transition-colors",
                "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground",
                collapsed && !isMobile && "justify-center px-2"
              )}
              aria-current={isActive ? "page" : undefined}
              title={collapsed && !isMobile ? item.name : undefined}
            >
              <item.icon className="size-4 shrink-0" aria-hidden="true" />
              {(!collapsed || isMobile) && <span className="truncate">{item.name}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-border p-3 shrink-0">
        {!collapsed || isMobile ? (
          <div className="space-y-2">
            <div className="flex items-center gap-3 px-2 py-1.5">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <User className="size-4 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium">{user?.username || "User"}</p>
                <p className="truncate text-[10px] text-muted-foreground">{user?.email}</p>
              </div>
              <Badge variant="outline" className="shrink-0 text-[10px] capitalize">
                {role?.toLowerCase() || "user"}
              </Badge>
            </div>
            <Button variant="outline" className="w-full justify-start gap-2" onClick={logout}>
              <LogOut className="size-3.5" />
              <span>Sign Out</span>
            </Button>
          </div>
        ) : (
          <Button variant="ghost" size="icon" onClick={logout} className="mx-auto flex" aria-label="Sign out" title="Sign Out">
            <LogOut className="size-4" />
          </Button>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar - flex child, not fixed */}
      <aside
        className={cn(
          "hidden shrink-0 flex-col border-r border-border bg-sidebar transition-all duration-300 lg:flex",
          collapsed ? "w-16" : "w-64"
        )}
        data-collapsed={collapsed}
      >
        <NavContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onMobileClose} aria-hidden="true" />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-sidebar shadow-xl transition-transform duration-300 lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
        aria-hidden={!mobileOpen}
      >
        <NavContent isMobile />
      </aside>
    </>
  );
}