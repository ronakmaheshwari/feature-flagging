"use client";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";

import {
  Bell,
  Moon,
  Sun,
  User,
  LogOut,
  Settings,
  Menu,
} from "lucide-react";

import { useAuth } from "@/components/custom/authContext";
import { useTheme } from "next-themes";

export function Header({
  onMenuClick,
}: {
  onMenuClick?: () => void;
}) {
  const { user, role, token, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header
      className="
        sticky top-0 z-10
        flex h-16 shrink-0 items-center
        gap-4
        border-b border-border
        bg-background/95
        px-4
        backdrop-blur
        supports-[backdrop-filter]:bg-background/60
      "
    >
      {/* Mobile menu */}
      {onMenuClick && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="h-8 w-8 lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="size-4" />
        </Button>
      )}

      <div className="min-w-0 flex-1" />

      <div className="flex shrink-0 items-center gap-1">
        {/* Theme */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="relative h-8 w-8"
          aria-label="Toggle theme"
        >
          <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />

          <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative h-8 w-8"
              aria-label="Notifications"
            >
              <Bell className="size-4" />

              <span
                className="
                  absolute -right-1 -top-1
                  flex size-4 items-center justify-center
                  rounded-full
                  bg-destructive
                  text-[10px]
                  font-medium
                  text-destructive-foreground
                "
              >
                3
              </span>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="z-[100] w-80"
          >
            <DropdownMenuLabel className="font-medium">
              Notifications
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem className="py-2">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">
                  New feature flag created
                </p>

                <p className="text-xs text-muted-foreground">
                  2 minutes ago
                </p>
              </div>
            </DropdownMenuItem>

            <DropdownMenuItem className="py-2">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">
                  Flag "new-checkout" enabled
                </p>

                <p className="text-xs text-muted-foreground">
                  15 minutes ago
                </p>
              </div>
            </DropdownMenuItem>

            <DropdownMenuItem className="py-2">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">
                  Group "beta-users" updated
                </p>

                <p className="text-xs text-muted-foreground">
                  1 hour ago
                </p>
              </div>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem className="py-2">
              <span className="w-full text-sm">
                View all notifications
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative h-8 w-8 rounded-full"
              aria-label="User menu"
            >
              <div className="flex size-8 items-center justify-center rounded-full bg-primary/10">
                <User className="size-4 text-primary" />
              </div>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="z-[100] w-56"
          >
            <DropdownMenuLabel className="font-medium">
              {user?.username || "User"}
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem>
              <User className="mr-2 size-3.5" />
              Profile
            </DropdownMenuItem>

            <DropdownMenuItem>
              <Settings className="mr-2 size-3.5" />
              Settings
            </DropdownMenuItem>

            <DropdownMenuItem onClick={toggleTheme}>
              {theme === "dark" ? (
                <>
                  <Sun className="mr-2 size-3.5" />
                  Light Mode
                </>
              ) : (
                <>
                  <Moon className="mr-2 size-3.5" />
                  Dark Mode
                </>
              )}
            </DropdownMenuItem>

            {role === "ADMIN" && (
              <>
                <DropdownMenuSeparator />

                <DropdownMenuItem>
                  <Settings className="mr-2 size-3.5" />
                  Admin Panel
                </DropdownMenuItem>
              </>
            )}

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={logout}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 size-3.5" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}