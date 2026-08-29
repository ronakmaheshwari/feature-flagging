import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  ArrowLeft,
  Search,
  RotateCcw,
  Gamepad2,
  Sparkles,
  ShieldCheck,
  Zap,
  Compass,
  MapPinOff,
  Terminal,
  ChevronRight,
  BadgeIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const QUICK_ROUTES = [
  { label: "Home", path: "/dashboard", icon: Home },
  { label: "Sign In", path: "/signin", icon: ArrowLeft },
  { label: "Create Workspace", path: "/signup", icon: Sparkles }
];

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [rolloutPct, setRolloutPct] = useState(0);
  const [scanning, setScanning] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Simulated "searching every environment" animation on mount
  useEffect(() => {
    setScanning(true);
    setRolloutPct(0);
    const timer = setInterval(() => {
      setRolloutPct((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setScanning(false);
          return 100;
        }
        return prev + Math.floor(Math.random() * 14) + 6;
      });
    }, 180);
    return () => clearInterval(timer);
  }, []);

  const handleRetry = () => {
    setScanning(true);
    setRolloutPct(0);
    toast("Re-evaluating flag across all environments...");
    const timer = setInterval(() => {
      setRolloutPct((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setScanning(false);
          toast.error("Still resolves to NOT_FOUND in every environment");
          return 100;
        }
        return prev + Math.floor(Math.random() * 14) + 6;
      });
    }, 150);
  };

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      toast.error("Enter a path or flag key to search");
      return;
    }
    toast.error(`No route matches "${searchQuery}" — redirecting home`);
    setTimeout(() => navigate("/dashboard"), 900);
  };

  const requestedPath = location?.pathname || "/unknown-route";

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-neutral-950 text-neutral-100 selection:bg-emerald-500/30 selection:text-emerald-200 p-4 sm:p-8 relative overflow-hidden">
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 left-1/3 w-80 h-80 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-2xl relative z-10">
        <Card className="bg-neutral-900/80 border-neutral-800 shadow-2xl backdrop-blur-md gap-0 py-0 overflow-hidden">
          <CardHeader className="border-b border-neutral-800/80 py-4 gap-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center size-9 rounded-xl bg-linear-to-br from-emerald-400 to-teal-600 text-neutral-950 font-bold shadow-lg shadow-emerald-500/20">
                  <BadgeIcon className="size-4.5 fill-neutral-950 stroke-neutral-950" />
                </div>
                <div>
                  <CardTitle className="text-white text-base font-bold tracking-tight">
                    FlagOps Router
                  </CardTitle>
                  <CardDescription className="text-neutral-400 text-xs">
                    Route Evaluation Console
                  </CardDescription>
                </div>
              </div>
              <Badge
                variant="outline"
                className="font-mono text-[10px] uppercase tracking-wider border-rose-500/30 bg-rose-500/10 text-rose-400"
              >
                404 · NOT_FOUND
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="pt-5 pb-2">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-neutral-800 text-neutral-300 border border-neutral-700 font-mono text-[10px]">
                <Gamepad2 className="size-3 mr-1 text-emerald-400" />
                Interactive Flag Miss
              </Badge>
              <Badge variant="outline" className="border-neutral-800 text-neutral-500 font-mono text-[10px]">
                env: production
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight mb-1.5">
              This route flag evaluated to <span className="text-rose-400">false</span> everywhere.
            </h1>
            <p className="text-sm text-neutral-400 leading-relaxed mb-4">
              We ran <code className="text-emerald-400 font-mono text-xs">route_exists("{requestedPath}")</code>{" "}
              across every environment and it never rolled out. Here's the live evaluation trace.
            </p>

            <div className="rounded-xl bg-neutral-950 border border-neutral-800/90 p-3 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-white font-mono flex items-center gap-1.5">
                  <MapPinOff className="size-3.5 text-rose-400" />
                  route_exists("{requestedPath}")
                </span>
                <span className="text-[11px] font-mono text-neutral-400">
                  {scanning ? "Scanning..." : "Complete"}
                </span>
              </div>
              <Progress
                value={rolloutPct}
                className="h-1.5 bg-neutral-900 [&>div]:bg-rose-500"
              />
              <div className="mt-2 flex items-center justify-between text-[11px] font-mono">
                <span className="text-neutral-500">
                  {rolloutPct}% of environments checked
                </span>
                <span className={scanning ? "text-amber-400" : "text-rose-400 font-semibold"}>
                  {scanning ? "evaluating..." : "0% rollout — dead route"}
                </span>
              </div>
            </div>

            <Tabs defaultValue="quick" className="w-full">
              <TabsList className="bg-neutral-900 border border-neutral-800 h-8 p-0.5">
                <TabsTrigger
                  value="quick"
                  className="text-xs data-[state=active]:bg-neutral-800 data-[state=active]:text-emerald-400"
                >
                  Quick Routes
                </TabsTrigger>
                <TabsTrigger
                  value="search"
                  className="text-xs data-[state=active]:bg-neutral-800 data-[state=active]:text-emerald-400"
                >
                  Search Instead
                </TabsTrigger>
                <TabsTrigger
                  value="trace"
                  className="text-xs data-[state=active]:bg-neutral-800 data-[state=active]:text-emerald-400"
                >
                  Raw Trace
                </TabsTrigger>
              </TabsList>

              <TabsContent value="quick" className="mt-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {QUICK_ROUTES.map((route) => {
                    const Icon = route.icon;
                    return (
                      <Button
                        key={route.path}
                        variant="outline"
                        onClick={() => navigate(route.path)}
                        className="justify-between bg-neutral-900/60 border-neutral-800 hover:bg-neutral-800 hover:border-emerald-500/40 text-neutral-200 text-xs h-auto py-2.5 cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <Icon className="size-3.5 text-emerald-400" />
                          {route.label}
                        </span>
                        <ChevronRight className="size-3.5 text-neutral-500" />
                      </Button>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="search" className="mt-3">
                <form onSubmit={handleQuickSearch} className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-neutral-500" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search for a page or flag key..."
                      className="pl-9 h-9 bg-neutral-900/90 border-neutral-800 text-xs text-neutral-100 placeholder-neutral-500 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500/80"
                    />
                  </div>
                  <Button
                    type="submit"
                    size="sm"
                    className="h-9 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-semibold text-xs cursor-pointer"
                  >
                    Search
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="trace" className="mt-3">
                <div className="bg-neutral-950 rounded-lg p-2.5 font-mono text-[11px] text-neutral-300 border border-neutral-800/90 overflow-x-auto flex items-start gap-2">
                  <Terminal className="size-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <pre className="leading-relaxed">
{`{
  "requested_path": "${requestedPath}",
  "matched_route": null,
  "flag_key": "route_exists",
  "rollout_pct": 0,
  "environments_checked": ["prod", "staging", "canary"],
  "resolution": "NOT_FOUND"
}`}
                  </pre>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>

          <Separator className="bg-neutral-800/80" />

          <CardFooter className="py-3 flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <div className="flex items-center gap-3 text-[11px] text-neutral-500">
              <span className="flex items-center gap-1">
                <Zap className="size-3 text-emerald-400" />
                Edge Evaluated
              </span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="size-3 text-neutral-400" />
                Zero Telemetry Leaks
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRetry}
                disabled={scanning}
                className="text-neutral-300 hover:text-white hover:bg-neutral-800 text-xs h-8 cursor-pointer"
              >
                <RotateCcw className={`size-3.5 mr-1.5 ${scanning ? "animate-spin" : ""}`} />
                Re-evaluate
              </Button>
              <Button
                asChild
                size="sm"
                className="bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-neutral-950 font-semibold text-xs h-8 cursor-pointer"
              >
                <Link to="/dashboard">
                  <Compass className="size-3.5 mr-1.5" />
                  Take Me Home
                </Link>
              </Button>
            </div>
          </CardFooter>
        </Card>

        <p className="text-center text-[11px] text-neutral-600 mt-3 font-mono">
          error_code: 404 · trace_id: {Math.random().toString(36).slice(2, 10)}
        </p>
      </div>
    </div>
  );
};

export default NotFound;