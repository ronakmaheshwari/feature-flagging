import React, { useState, useMemo, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ShieldCheck,
  KeyRound,
  Zap,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  RotateCcw,
  Sliders,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Gamepad2,
  Hammer,
  Cpu,
  BookOpen,
  Bomb,
  ShieldAlert,
  Check,
  X,
  BadgeIcon
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/api";

const charsetSize = (pass: string) => {
  let size = 0;
  if (/[a-z]/.test(pass)) size += 26;
  if (/[A-Z]/.test(pass)) size += 26;
  if (/[0-9]/.test(pass)) size += 10;
  if (/[^A-Za-z0-9]/.test(pass)) size += 32;
  return size || 1;
};

const calcEntropyBits = (pass: string) => {
  if (!pass) return 0;
  return Math.log2(charsetSize(pass)) * pass.length;
};

const ATTACKERS = [
  { id: "dictionary", name: "Dictionary Bot", icon: BookOpen, rate: 1e6, color: "amber" },
  { id: "brute", name: "Brute-Force Rig", icon: Hammer, rate: 1e9, color: "cyan" },
  { id: "gpu", name: "GPU Cluster (8x)", icon: Cpu, rate: 1e11, color: "rose" }
];

const formatCrackTime = (seconds: number) => {
  if (!isFinite(seconds) || seconds <= 0) return "Instant";
  const units: [string, number][] = [
    ["century", 3153600000],
    ["year", 31536000],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
    ["second", 1]
  ];
  for (const [label, secs] of units) {
    if (seconds >= secs) {
      const val = seconds / secs;
      return `${val >= 1000 ? val.toExponential(1) : val.toFixed(val < 10 ? 1 : 0)} ${label}${val >= 2 ? "s" : ""}`;
    }
  }
  return "Instant";
};

const crackProgressPct = (seconds: number) => {
  const referenceMax = 3153600000; // 100 years in seconds, our "fully safe" ceiling
  const clamped = Math.min(seconds, referenceMax);
  const pct = 100 - (Math.log10(clamped + 1) / Math.log10(referenceMax + 1)) * 100;
  return Math.max(0, Math.min(100, pct));
};

const ResetPassword = () => {
  const {link} = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Security flags — each one visibly multiplies/divides the effective crack time
  const [adaptiveHashFlag, setAdaptiveHashFlag] = useState<boolean>(true); // bcrypt cost factor
  const [pepperFlag, setPepperFlag] = useState<boolean>(false); // server-side secret pepper
  const [breachListFlag, setBreachListFlag] = useState<boolean>(true); // rejects known-leaked passwords
  const [passphraseModeFlag, setPassphraseModeFlag] = useState<boolean>(false); // encourages length over symbols

  const [activeConsoleTab, setActiveConsoleTab] = useState<"sdk" | "eval">("sdk");
  const [tick, setTick] = useState(0);

  // Animate the attacker bars continuously (gives the "forge" a pulse even at rest)
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 900);
    return () => clearInterval(interval);
  }, []);

  const commonPasswords = ["password", "123456", "qwerty", "letmein", "iloveyou", "admin123"];
  const isBreached = breachListFlag && commonPasswords.includes(password.toLowerCase());

  const baseEntropy = calcEntropyBits(password);

  // Flags apply multipliers to effective guesses-needed, simulating real hardening measures
  const hashCostMultiplier = adaptiveHashFlag ? 4096 : 1; // bcrypt cost ~2^12 vs plaintext-ish
  const pepperMultiplier = pepperFlag ? 1e6 : 1; // attacker doesn't have the pepper, so brute-forcing it blind
  const passphraseBonusBits = passphraseModeFlag && password.length >= 16 ? 8 : 0;

  const effectiveEntropy = baseEntropy + passphraseBonusBits;
  const totalGuesses = isBreached ? 1 : Math.pow(2, effectiveEntropy) * hashCostMultiplier * pepperMultiplier;

  const attackerResults = useMemo(() => {
    return ATTACKERS.map((a) => {
      const seconds = isBreached ? 0 : totalGuesses / a.rate / 2; // /2 = average case
      return {
        ...a,
        seconds,
        crackTimeLabel: isBreached ? "Already Leaked" : formatCrackTime(seconds),
        progress: isBreached ? 100 : crackProgressPct(seconds)
      };
    });
  }, [totalGuesses, isBreached, tick]);

  const strengthLabel = isBreached
    ? "Compromised"
    : effectiveEntropy < 28
    ? "Weak"
    : effectiveEntropy < 45
    ? "Fair"
    : effectiveEntropy < 65
    ? "Strong"
    : "Fortress";

  const strengthColor = isBreached
    ? "text-rose-400"
    : effectiveEntropy < 28
    ? "text-rose-400"
    : effectiveEntropy < 45
    ? "text-amber-400"
    : effectiveEntropy < 65
    ? "text-cyan-400"
    : "text-emerald-400";

  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const meetsMinimum = password.length >= 8 && !isBreached;
  const canSubmit = passwordsMatch && meetsMinimum;

  const unlockedCount = [adaptiveHashFlag, pepperFlag, breachListFlag, passphraseModeFlag].filter(Boolean).length;

  const resetGame = () => {
    setAdaptiveHashFlag(true);
    setPepperFlag(false);
    setBreachListFlag(true);
    setPassphraseModeFlag(false);
    setPassword("");
    setConfirmPassword("");
    toast("Cipher forge reset to defaults");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetsMinimum) {
      toast.error(isBreached ? "This password appears in known breach lists" : "Password must be at least 8 characters");
      return;
    }
    if (!passwordsMatch) {
      toast.error("Passwords do not match");
      return;
    }
    mutation.mutate();
  };

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await api.patch(`/user/forget-password/${link}`, {
        password
      });
      return res.data;
    },
    onSuccess: (data) => {
      if (data.success === true) {
        toast.success("Password updated — sign in with your new credentials");
        navigate("/signin");
      }
    },
    onError: (data: any) => {
      const err = data?.response?.data?.message || data?.message || "An unexpected error took place";
      toast(typeof err === "string" ? err : JSON.stringify(err));
    }
  });

  return (
    <div className="h-screen w-full flex bg-neutral-950 text-neutral-100 selection:bg-emerald-500/30 selection:text-emerald-200 overflow-hidden">
      <div className="hidden lg:flex lg:w-7/12 relative flex-col p-6 xl:p-8 overflow-hidden border-r border-neutral-800/80 bg-neutral-950 h-full justify-between">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 left-1/3 w-80 h-80 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-xl mx-auto flex flex-col justify-between h-full relative z-10">
          <div className="w-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center size-9 rounded-xl bg-linear-to-br from-emerald-400 to-teal-600 text-neutral-950 font-bold shadow-lg shadow-emerald-500/20">
                  <BadgeIcon className="size-4.5 fill-neutral-950 stroke-neutral-950" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold tracking-tight text-white">
                      FlagOps Cipher Forge
                    </span>
                    <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Live Attack Sim
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400">
                    Real-Time Entropy & Crack-Time Modeling
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-neutral-900/90 border border-neutral-800 text-xs font-mono">
                <Gamepad2 className="size-3.5 text-emerald-400" />
                <span className="text-neutral-400">Hardening:</span>
                <span className="text-emerald-400 font-bold">{unlockedCount}/4</span>
              </div>
            </div>
          </div>

          <div className="w-full my-auto py-2">
            <div className="mb-2.5">
              <div className="flex items-center justify-between mb-1.5">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-neutral-900/90 border border-neutral-800 text-xs text-neutral-300 backdrop-blur-sm">
                  <Sparkles className="size-3.5 text-emerald-400" />
                  <span>Interactive Cipher Forge</span>
                </div>
                <div className="text-[11px] font-mono text-neutral-400">
                  Type on the right, watch the attackers here
                </div>
              </div>
              <h2 className="text-2xl xl:text-3xl font-bold tracking-tight text-white leading-tight mb-1">
                Outrun three simulated attackers.
              </h2>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Every keystroke recalculates entropy live. Toggle hardening flags below to see
                how each one bends the crack-time curve.
              </p>
            </div>

            <div className="bg-neutral-900/80 rounded-2xl border border-neutral-800 shadow-2xl p-3 backdrop-blur-md">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-800/80 text-xs text-neutral-400 font-mono">
                <div className="flex items-center gap-2">
                  <Sliders className="size-3.5 text-emerald-400" />
                  <span>ATTACK SIMULATOR (Live)</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={resetGame}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] font-mono transition-colors cursor-pointer border border-neutral-700 active:scale-95"
                    title="Reset the cipher forge"
                  >
                    <RotateCcw className="size-3 text-emerald-400" />
                    <span>Reset</span>
                  </button>
                  <span className="flex items-center gap-1.5 text-[11px] text-emerald-400">
                    <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Recalculating
                  </span>
                </div>
              </div>

              <div className="p-2 rounded-xl bg-neutral-900/40 border border-neutral-800/60 mb-1.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-white font-mono">effective_entropy_bits</span>
                  <span className={`text-[11px] font-mono font-bold ${strengthColor}`}>
                    {effectiveEntropy.toFixed(1)} bits — {strengthLabel}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-neutral-950 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${
                      isBreached
                        ? "bg-rose-500"
                        : effectiveEntropy < 28
                        ? "bg-rose-500"
                        : effectiveEntropy < 45
                        ? "bg-amber-500"
                        : effectiveEntropy < 65
                        ? "bg-cyan-500"
                        : "bg-emerald-500"
                    }`}
                    style={{ width: `${Math.min(100, (effectiveEntropy / 80) * 100)}%` }}
                  />
                </div>
                {isBreached && (
                  <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-rose-400 font-medium">
                    <ShieldAlert className="size-3.5" />
                    <span>Matches a known breached-password list — instantly guessable.</span>
                  </div>
                )}
              </div>

              {/* Attacker race bars */}
              <div className="space-y-1.5 mb-1.5">
                {attackerResults.map((attacker) => {
                  const Icon = attacker.icon;
                  return (
                    <div
                      key={attacker.id}
                      className="p-2 rounded-xl bg-neutral-900/40 border border-neutral-800/60"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <Icon
                            className={`size-3.5 ${
                              attacker.color === "amber"
                                ? "text-amber-400"
                                : attacker.color === "cyan"
                                ? "text-cyan-400"
                                : "text-rose-400"
                            }`}
                          />
                          <span className="text-xs font-semibold text-white">{attacker.name}</span>
                        </div>
                        <span className="text-[11px] font-mono text-neutral-300">
                          ETA: <strong className="text-white">{attacker.crackTimeLabel}</strong>
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-neutral-950 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 rounded-full ${
                            attacker.color === "amber"
                              ? "bg-amber-500"
                              : attacker.color === "cyan"
                              ? "bg-cyan-500"
                              : "bg-rose-500"
                          }`}
                          style={{ width: `${attacker.progress}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Hardening flags */}
              <div className="space-y-1.5">
                {[
                  {
                    id: "hash",
                    key: "adaptive_hash_cost",
                    name: "Adaptive Hash Cost (bcrypt)",
                    enabled: adaptiveHashFlag,
                    toggle: () => setAdaptiveHashFlag(!adaptiveHashFlag),
                    rules: "×4096 slowdown per guess",
                    tag: "Core"
                  },
                  {
                    id: "pepper",
                    key: "server_side_pepper",
                    name: "Server-Side Pepper",
                    enabled: pepperFlag,
                    toggle: () => setPepperFlag(!pepperFlag),
                    rules: "secret unknown to attacker",
                    tag: "Crypto"
                  },
                  {
                    id: "breach",
                    key: "breach_list_check",
                    name: "Breach-List Rejection",
                    enabled: breachListFlag,
                    toggle: () => setBreachListFlag(!breachListFlag),
                    rules: "blocks top leaked passwords",
                    tag: "Policy"
                  },
                  {
                    id: "passphrase",
                    key: "passphrase_mode",
                    name: "Passphrase Mode Bonus",
                    enabled: passphraseModeFlag,
                    toggle: () => setPassphraseModeFlag(!passphraseModeFlag),
                    rules: "rewards length ≥ 16 chars",
                    tag: "UX"
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
                      {flag.enabled ? (
                        <CheckCircle2 className="size-4 text-emerald-400" />
                      ) : (
                        <X className="size-4 text-neutral-500" />
                      )}
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
                  <span className="text-[10px] text-neutral-500">Model: log2(charset) × length</span>
                </div>

                <div className="bg-neutral-950 rounded-lg p-2 font-mono text-xs text-neutral-300 border border-neutral-800/90 overflow-x-auto">
                  {activeConsoleTab === "sdk" ? (
                    <pre className="text-[11px] leading-relaxed text-neutral-300">
                      <span className="text-purple-400">const</span>{" "}
                      <span className="text-blue-300">entropy</span> ={" "}
                      <span className="text-yellow-300">useEntropyMeter</span>(password, {"{"}
                      {"\n"}  hashCost: <span className="text-emerald-300">{adaptiveHashFlag ? "'bcrypt-12'" : "'none'"}</span>,
                      {"\n"}  pepper: <span className="text-emerald-300">{pepperFlag ? "true" : "false"}</span>
                      {"\n"}{"}"});{" "}
                      <span className="text-neutral-500">
                        // =&gt; {effectiveEntropy.toFixed(1)} bits
                      </span>
                    </pre>
                  ) : (
                    <pre className="text-[11px] leading-relaxed text-neutral-300">
                      {"{\n"}
                      {`  "adaptive_hash_cost": ${adaptiveHashFlag},\n`}
                      {`  "server_side_pepper": ${pepperFlag},\n`}
                      {`  "breach_list_check": ${breachListFlag},\n`}
                      {`  "passphrase_mode": ${passphraseModeFlag},\n`}
                      {`  "entropy_bits": ${effectiveEntropy.toFixed(1)}\n`}
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
              <span>Client-Side Simulation Only</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Bomb className="size-3.5 text-cyan-400" />
              <span>3 Attacker Archetypes</span>
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
              <BadgeIcon className="size-4.5 fill-neutral-950 stroke-neutral-950" />
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
              Set a new password
            </h1>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Choose something strong — watch the attackers on the left react as you type.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-2.5">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                  <Lock className="size-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2 bg-neutral-900/90 border border-neutral-800 rounded-xl text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/50 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>

              {password.length > 0 && (
                <div className="mt-1.5 flex items-center justify-between text-[10px]">
                  <span className="text-neutral-400 font-mono">
                    Fastest attacker cracks in:
                  </span>
                  <span className={`font-semibold ${strengthColor}`}>
                    {isBreached ? "Instant (breached)" : attackerResults[2]?.crackTimeLabel}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                  <Lock className="size-4" />
                </div>
                <input
                  type={showConfirm ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className={`w-full pl-10 pr-10 py-2 bg-neutral-900/90 border rounded-xl text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-1 transition-all font-mono ${
                    confirmPassword.length > 0
                      ? passwordsMatch
                        ? "border-emerald-500/70 focus:border-emerald-500/80 focus:ring-emerald-500/50"
                        : "border-rose-500/70 focus:border-rose-500/80 focus:ring-rose-500/50"
                      : "border-neutral-800 focus:border-emerald-500/80 focus:ring-emerald-500/50"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer"
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {confirmPassword.length > 0 && (
                <div className="mt-1 flex items-center gap-1.5 text-[11px]">
                  {passwordsMatch ? (
                    <>
                      <Check className="size-3 text-emerald-400" />
                      <span className="text-emerald-400">Passwords match</span>
                    </>
                  ) : (
                    <>
                      <X className="size-3 text-rose-400" />
                      <span className="text-rose-400">Passwords do not match</span>
                    </>
                  )}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={!canSubmit || mutation.isPending}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-neutral-950 font-semibold text-xs transition-all shadow-lg shadow-emerald-500/15 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none cursor-pointer mt-1.5"
            >
              {mutation.isPending ? (
                <div className="size-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Update Password</span>
                  <ArrowRight className="size-4" />
                </>
              )}
            </button>

            {!canSubmit && (password.length > 0 || confirmPassword.length > 0) && (
              <p className="text-xs text-center text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl py-1.5 px-3 mt-1.5 font-medium flex items-center justify-center gap-1.5">
                <AlertCircle className="size-3.5 shrink-0" />
                <span>
                  {isBreached
                    ? "Choose a password not found in breach lists"
                    : password.length < 8
                    ? "Minimum 8 characters required"
                    : "Passwords must match to continue"}
                </span>
              </p>
            )}
          </form>

          <div className="text-center mt-3 pt-3 border-t border-neutral-900">
            <p className="text-xs text-neutral-400">
              Changed your mind?{" "}
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

export default ResetPassword;