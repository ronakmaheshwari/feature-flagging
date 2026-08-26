import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Flag,
  ShieldCheck,
  Zap,
  Mail,
  ArrowRight,
  RotateCcw,
  Sliders,
  Sparkles,
  AlertCircle,
  KeyRound,
  Gamepad2,
  Users,
  CheckCircle2,
  XCircle,
  Radar,
  GitCommit,
  Send
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/api";

// Deterministic pseudo-hash so the same "user id" always buckets the same way
// until you nudge the rollout slider — mirrors how real feature-flag bucketing works.
const hashToBucket = (seed: number) => {
  const x = Math.sin(seed * 999) * 10000;
  return Math.floor((x - Math.floor(x)) * 100);
};

const SIMULATED_USERS = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  bucket: hashToBucket(i + 1)
}));

const ForgetPassword = () => {
  const [email, setEmail] = useState<string>("");

  const [rolloutPct, setRolloutPct] = useState<number>(35);
  const [canaryFlag, setCanaryFlag] = useState<boolean>(true);
  const [geoFenceFlag, setGeoFenceFlag] = useState<boolean>(false);
  const [linkExpiryFlag, setLinkExpiryFlag] = useState<boolean>(true);

  const [activeConsoleTab, setActiveConsoleTab] = useState<"sdk" | "eval">("sdk");

  const resetGame = () => {
    setRolloutPct(35);
    setCanaryFlag(true);
    setGeoFenceFlag(false);
    setLinkExpiryFlag(true);
    toast("Rollout simulator reset to defaults");
  };

  const sentCount = useMemo(
    () => SIMULATED_USERS.filter((u) => u.bucket < rolloutPct).length,
    [rolloutPct]
  );

  const flagEnabled = canaryFlag && rolloutPct > 0;
  const unlockedCount = [canaryFlag, geoFenceFlag, linkExpiryFlag].filter(Boolean).length;

  const handleSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      return toast.error("Please provide an email address");
    } else if (!email.includes("@")) {
      return toast.error("Invalid email was provided");
    } else if (!flagEnabled) {
      return toast.error("recovery_link_rollout is disabled for this bucket");
    } else {
      mutation.mutate();
    }
  };

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await api.patch(`/user/forget-password/${email}`);
      return res.data;
    },
    onSuccess: (data) => {
      if (data.success === true) {
        toast.success("A link was dispatched successfully");
      }
    },
    onError: (data: any) => {
      const err = data?.response?.data?.message || data?.message || "An unexpected error took place";
      toast(typeof err === "string" ? err : JSON.stringify(err));
    }
  });

  return (
    <div className="h-screen w-full flex bg-neutral-950 text-neutral-100 selection:bg-emerald-500/30 selection:text-emerald-200 overflow-hidden">
      {/* LEFT: Rollout Simulator Game Panel */}
      <div className="hidden lg:flex lg:w-7/12 relative flex-col p-6 xl:p-8 overflow-hidden border-r border-neutral-800/80 bg-neutral-950 h-full justify-between">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 left-1/3 w-80 h-80 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-xl mx-auto flex flex-col justify-between h-full relative z-10">
          <div className="w-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center size-9 rounded-xl bg-linear-to-br from-emerald-400 to-teal-600 text-neutral-950 font-bold shadow-lg shadow-emerald-500/20">
                  <Flag className="size-4.5 fill-neutral-950 stroke-neutral-950" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold tracking-tight text-white">
                      FlagOps Recovery
                    </span>
                    <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Canary Console
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400">
                    Progressive Rollout & Recovery Link Targeting
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-neutral-900/90 border border-neutral-800 text-xs font-mono">
                <Gamepad2 className="size-3.5 text-emerald-400" />
                <span className="text-neutral-400">Rules:</span>
                <span className="text-emerald-400 font-bold">{unlockedCount}/3</span>
              </div>
            </div>
          </div>

          <div className="w-full my-auto py-2">
            <div className="mb-2.5">
              <div className="flex items-center justify-between mb-1.5">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-neutral-900/90 border border-neutral-800 text-xs text-neutral-300 backdrop-blur-sm">
                  <Sparkles className="size-3.5 text-emerald-400" />
                  <span>Interactive Rollout Simulator</span>
                </div>
                <div className="text-[11px] font-mono text-neutral-400">
                  Drag to bucket simulated users
                </div>
              </div>
              <h2 className="text-2xl xl:text-3xl font-bold tracking-tight text-white leading-tight mb-1">
                Drag the rollout dial to unlock recovery links.
              </h2>
              <p className="text-xs text-neutral-400 leading-relaxed">
                <code className="text-emerald-400">recovery_link_rollout</code> is evaluated per-user
                via consistent hashing — watch the bucket below shift live as you move the slider.
              </p>
            </div>

            <div className="bg-neutral-900/80 rounded-2xl border border-neutral-800 shadow-2xl p-3 backdrop-blur-md">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-800/80 text-xs text-neutral-400 font-mono">
                <div className="flex items-center gap-2">
                  <Sliders className="size-3.5 text-emerald-400" />
                  <span>CONTROL PLANE (Interactive Game)</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={resetGame}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] font-mono transition-colors cursor-pointer border border-neutral-700 active:scale-95"
                    title="Reset the rollout simulator"
                  >
                    <RotateCcw className="size-3 text-emerald-400" />
                    <span>Reset</span>
                  </button>
                  <span className="flex items-center gap-1.5 text-[11px] text-emerald-400">
                    <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    0.6ms
                  </span>
                </div>
              </div>

              {/* Rollout slider */}
              <div className="p-2 rounded-xl bg-neutral-900/40 border border-neutral-800/60 mb-1.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-white font-mono">recovery_link_rollout</span>
                  <span className="text-[11px] font-mono text-emerald-400 font-bold">{rolloutPct}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={rolloutPct}
                  onChange={(e) => setRolloutPct(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="mt-2 flex flex-wrap gap-1">
                  {SIMULATED_USERS.map((u) => {
                    const inBucket = u.bucket < rolloutPct;
                    return (
                      <div
                        key={u.id}
                        title={`user_${u.id} • bucket ${u.bucket}`}
                        className={`size-4 rounded-sm flex items-center justify-center transition-colors duration-200 ${
                          inBucket
                            ? "bg-emerald-500/80"
                            : "bg-neutral-800 border border-neutral-700"
                        }`}
                      >
                        {inBucket ? (
                          <CheckCircle2 className="size-2.5 text-neutral-950" />
                        ) : (
                          <XCircle className="size-2.5 text-neutral-600" />
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-neutral-400">
                  <Users className="size-3 text-emerald-400" />
                  <span>
                    <strong className="text-emerald-400">{sentCount}</strong> / {SIMULATED_USERS.length} simulated users receive the link
                  </span>
                </div>
              </div>

              {/* Toggle rules */}
              <div className="space-y-1.5">
                {[
                  {
                    id: "canary",
                    key: "canary_release_gate",
                    name: "Canary Release Gate",
                    enabled: canaryFlag,
                    toggle: () => setCanaryFlag(!canaryFlag),
                    rules: "master switch for rollout %",
                    tag: "Core"
                  },
                  {
                    id: "geo",
                    key: "geo_fence_recovery",
                    name: "Geo-Fenced Recovery",
                    enabled: geoFenceFlag,
                    toggle: () => setGeoFenceFlag(!geoFenceFlag),
                    rules: "whitelist: IN, US, EU",
                    tag: "Targeting"
                  },
                  {
                    id: "expiry",
                    key: "link_expiry_15m",
                    name: "15-Minute Link Expiry",
                    enabled: linkExpiryFlag,
                    toggle: () => setLinkExpiryFlag(!linkExpiryFlag),
                    rules: "security default",
                    tag: "Security"
                  }
                ].map((flag) => (
                  <div
                    key={flag.id}
                    onClick={flag.toggle}
                    className={`group flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer select-none ${
                      flag.enabled
                        ? "bg-neutral-800/60 border-emerald-500/40 shadow-sm shadow-emerald-500/5"
                        : "bg-neutral-900/40 border-neutral-800/60 opacity-60 hover:opacity-100 hover:border-neutral-700"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Radar
                        className={`size-4 transition-colors ${
                          flag.enabled ? "text-emerald-400" : "text-neutral-500"
                        }`}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-white font-mono">{flag.key}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-400 border border-neutral-700">
                            {flag.tag}
                          </span>
                        </div>
                        <div className="text-[11px] text-neutral-400 mt-0.5">{flag.rules}</div>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-full ${
                        flag.enabled
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : "bg-neutral-800 text-neutral-500 border border-neutral-700"
                      }`}
                    >
                      {flag.enabled ? "ACTIVE" : "OFF"}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-2 pt-2 border-t border-neutral-800/80">
                <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 mb-1.5">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveConsoleTab("sdk")}
                      className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                        activeConsoleTab === "sdk"
                          ? "bg-neutral-800 text-emerald-400 font-medium"
                          : "text-neutral-500 hover:text-neutral-300"
                      }`}
                    >
                      React SDK
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveConsoleTab("eval")}
                      className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                        activeConsoleTab === "eval"
                          ? "bg-neutral-800 text-cyan-400 font-medium"
                          : "text-neutral-500 hover:text-neutral-300"
                      }`}
                    >
                      Evaluation JSON
                    </button>
                  </div>
                  <span className="text-[10px] text-neutral-500">Consistent Hash Bucketing</span>
                </div>

                <div className="bg-neutral-950 rounded-lg p-2 font-mono text-xs text-neutral-300 border border-neutral-800/90 overflow-x-auto">
                  {activeConsoleTab === "sdk" ? (
                    <pre className="text-[11px] leading-relaxed text-neutral-300">
                      <span className="text-purple-400">const</span>{" "}
                      <span className="text-blue-300">canSendRecovery</span> ={" "}
                      <span className="text-yellow-300">useFeatureFlag</span>(
                      <span className="text-emerald-300">"recovery_link_rollout"</span>, {"{"} email {"}"});{" "}
                      <span className="text-neutral-500">
                        // =&gt; {flagEnabled ? "true" : "false"} @ {rolloutPct}%
                      </span>
                    </pre>
                  ) : (
                    <pre className="text-[11px] leading-relaxed text-neutral-300">
                      {"{\n"}
                      {`  "recovery_link_rollout": ${rolloutPct},\n`}
                      {`  "canary_release_gate": ${canaryFlag},\n`}
                      {`  "geo_fence_recovery": ${geoFenceFlag},\n`}
                      {`  "link_expiry_15m": ${linkExpiryFlag}\n`}
                      {"}"}
                    </pre>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="w-full pt-3 border-t border-neutral-900 flex items-center justify-between text-xs text-neutral-400">
            <div className="flex items-center gap-1.5">
              <Zap className="size-3.5 text-emerald-400" />
              <span>Edge Evaluated</span>
            </div>
            <div className="flex items-center gap-1.5">
              <GitCommit className="size-3.5 text-cyan-400" />
              <span>Consistent Hashing</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-purple-400" />
              <span>SOC2 Compliant</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: Form Panel */}
      <div className="w-full lg:w-5/12 flex flex-col justify-between p-6 xl:p-8 h-full overflow-y-auto lg:overflow-hidden">
        <div className="flex lg:hidden items-center justify-between pb-3 mb-2 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center size-8 rounded-lg bg-linear-to-br from-emerald-400 to-teal-600 text-neutral-950 font-bold shadow-md">
              <Flag className="size-4 fill-neutral-950 stroke-neutral-950" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">FlagOps</span>
          </div>
          <span className="text-[11px] font-mono text-neutral-400 bg-neutral-900 px-2 py-1 rounded border border-neutral-800">
            Reset Password
          </span>
        </div>

        <div className="my-auto max-w-md w-full mx-auto py-1">
          <div className="mb-3 text-center sm:text-left">
            <div className="inline-flex items-center justify-center size-12 rounded-2xl bg-linear-to-br from-emerald-400/20 to-teal-600/20 text-emerald-400 border border-emerald-500/30 mb-2 shadow-inner">
              <KeyRound className="size-6" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-1">
              Forgot your password?
            </h1>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Enter your workspace email and we'll dispatch a secure recovery link,
              subject to the rollout rules on the left.
            </p>
          </div>

          <form onSubmit={handleSubmission} className="space-y-2.5">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Work Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                  <Mail className="size-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ronak@company.com"
                  className="w-full pl-10 pr-3.5 py-2 bg-neutral-900/90 border border-neutral-800 rounded-xl text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                />
              </div>
            </div>

            {geoFenceFlag && (
              <div className="flex items-start gap-1.5 text-[11px] text-neutral-400 bg-neutral-900/60 border border-neutral-800/80 rounded-xl p-2">
                <Radar className="size-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Geo-fencing active — link dispatch restricted to allowed regions.</span>
              </div>
            )}

            {linkExpiryFlag && (
              <div className="flex items-start gap-1.5 text-[11px] text-neutral-400 bg-neutral-900/60 border border-neutral-800/80 rounded-xl p-2">
                <ShieldCheck className="size-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>The link you receive will expire in 15 minutes for your security.</span>
              </div>
            )}

            <button
              type="submit"
              disabled={!flagEnabled || mutation.isPending}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-neutral-950 font-semibold text-xs transition-all shadow-lg shadow-emerald-500/15 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none cursor-pointer mt-1.5"
            >
              {mutation.isPending ? (
                <div className="size-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="size-4" />
                  <span>Send Recovery Link</span>
                  <ArrowRight className="size-4" />
                </>
              )}
            </button>

            {!flagEnabled && (
              <p className="text-xs text-center text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl py-1.5 px-3 mt-1.5 font-medium flex items-center justify-center gap-1.5">
                <AlertCircle className="size-3.5 shrink-0" />
                <span>
                  Raise <strong>recovery_link_rollout</strong> above 0% on the left to unlock sending
                </span>
              </p>
            )}
          </form>

          <div className="text-center mt-3 pt-3 border-t border-neutral-900">
            <p className="text-xs text-neutral-400">
              Remembered it after all?{" "}
              <Link to="/signin" className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">
                Back to sign in
              </Link>
            </p>
          </div>
        </div>

        <div className="text-center pt-2 border-t border-neutral-900 text-[10px] text-neutral-500 flex items-center justify-center gap-4">
          <span className="flex items-center gap-1">
            <ShieldCheck className="size-3 text-neutral-400" />
            256-bit TLS Encryption
          </span>
          <span>•</span>
          <span>Zero Telemetry Leaks</span>
        </div>
      </div>
    </div>
  );
};

export default ForgetPassword;