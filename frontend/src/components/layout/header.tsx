"use client";

import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Bell, Moon, Sun, User, LogOut, Settings } from "lucide-react";
import { useAuth } from "@/components/custom/authContext";
import { useTheme } from "next-themes";

export function Header() {
  const { user, role, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center px-4 gap-4">
      <div className="flex-1" />
      
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="h-8 w-8"
          aria-label="Toggle theme"
        >
          <Sun className="size-4 h-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute size-4 h-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full" aria-label="Notifications">
              <Bell className="size-4" />
              <span className="absolute -top-1 -right-1 size-4 rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground flex items-center justify-center">
                3
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="font-medium">Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="py-2" inset>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">New feature flag created</p>
                <p className="text-xs text-muted-foreground">2 minutes ago</p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem className="py-2" inset>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">Flag "new-checkout" enabled</p>
                <p className="text-xs text-muted-foreground">15 minutes ago</p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem className="py-2" inset>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">Group "beta-users" updated</p>
                <p className="text-xs text-muted-foreground">1 hour ago</p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="py-2" inset>
              <Button variant="ghost" className="w-full justify-start">View all notifications</Button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full flex items-center justify-center gap-1" aria-label="User menu">
              <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="size-4 text-primary" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-medium">{user?.username || "User"}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => {}} inset>
              <User className="size-3.5 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {}} inset>
              <Settings className="size-3.5 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")} inset>
              {theme === "dark" ? (
                <>
                  <Sun className="size-3.5 mr-2" />
                  Light Mode
                </>
              ) : (
                <>
                  <Moon className="size-3.5 mr-2" />
                  Dark Mode
                </>
              )}
            </DropdownMenuItem>
            {role === "ADMIN" && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => {}} inset>
                  <Settings className="size-3.5 mr-2" />
                  Admin Panel
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} inset className="text-destructive focus:text-destructive">
              <LogOut className="size-3.5 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}