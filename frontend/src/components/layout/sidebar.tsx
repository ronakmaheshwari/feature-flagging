"use client";

import * as React from "react";
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

export function Sidebar() {
  const { user, role, logout } = useAuth();
  console.log(`THe user: ${user}`)
  const location = useLocation();
  const [collapsed, setCollapsed] = React.useState(false);

  const filteredNav = navigation.filter((item) =>
    role && (item.roles as readonly ("USER" | "ADMIN")[]).includes(role)
  );

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r border-border bg-sidebar transition-all duration-300 flex flex-col",
        collapsed ? "w-16" : "w-64"
      )}
      data-collapsed={collapsed}
    >
      <div className="flex h-16 items-center justify-between px-4 border-b border-border">
        {!collapsed && (
          <NavLink to="/dashboard" className="flex items-center gap-2">
            <BadgeIcon className="size-5 text-primary" />
            <span className="font-mono font-bold text-lg">FlagOps</span>
          </NavLink>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1" role="navigation" aria-label="Main navigation">
        {filteredNav.map((item) => {
          const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + "/");
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-none transition-colors",
                "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground",
                collapsed && "justify-center"
              )}
              aria-current={isActive ? "page" : undefined}
              title={collapsed ? item.name : undefined}
            >
              <item.icon className="size-4 shrink-0" aria-hidden="true" />
              {!collapsed && <span>{item.name}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border">
        {!collapsed ? (
          <div className="space-y-2">
            <div className="flex items-center gap-3 px-2 py-1.5">
              <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="size-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{user?.username || "User"}</p>
                <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
              </div>
              <Badge variant="outline" className="text-[10px] capitalize">
                {role?.toLowerCase() || "user"}
              </Badge>
            </div>
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={logout}
            >
              <LogOut className="size-3.5" />
              <span>Sign Out</span>
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            className="mx-auto"
            aria-label="Sign out"
            title="Sign Out"
          >
            <LogOut className="size-4" />
          </Button>
        )}
      </div>
    </aside>
  );
}