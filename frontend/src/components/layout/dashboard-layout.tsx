import * as React from "react";
import { Outlet } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Sidebar } from "./sidebar";
import { Header } from "./header";

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const isMobile = React.useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < 1024;
  }, []);

  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div
        className={cn(
          "transition-all duration-300 lg:pl-64",
          isMobile && sidebarOpen ? "pl-64" : ""
        )}
      >
        <Header />
        <main
          className={cn(
            "p-4 lg:p-6 pt-20 lg:pt-6 min-h-[calc(100vh-4rem)]",
            isMobile && sidebarOpen && "pl-16"
          )}
          role="main"
        >
          <Outlet />
        </main>
      </div>
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Outlet />
    </div>
  );
}