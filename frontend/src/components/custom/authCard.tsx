import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Flag,
  ToggleLeft,
  ToggleRight,
  ShieldCheck,
  Zap,
  GitBranch,
  Layers,
  Code2,
  Lock,
  Unlock,
  Mail,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Sliders,
  Check,
  AlertCircle,
  RotateCcw,
  Gamepad2
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "./authContext";

interface AuthProps {
  type: "signup" | "signin";
  isLoading?: boolean;
  errorMessage?: string | null;
}

const AuthCard = ({
  type,
  isLoading = false,
  errorMessage = null
}: AuthProps) => {
  const isSignup = type === "signup";
  const flagName = isSignup ? "Signup" : "Signin";
  const navigate = useNavigate();
  const { setToken } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("USER");
  const [rememberMe, setRememberMe] = useState(false);

  const [githubFlag, setGithubFlag] = useState<boolean>(false);
  const [googleFlag, setGoogleFlag] = useState<boolean>(false);
  const [authPortalFlag, setAuthPortalFlag] = useState<boolean>(false);
  const [securityMeterFlag, setSecurityMeterFlag] = useState<boolean>(true);

  const [activeCodeTab, setActiveCodeTab] = useState<"sdk" | "eval">("sdk");

  const resetAllFlags = () => {
    setGithubFlag(false);
    setGoogleFlag(false);
    setAuthPortalFlag(false);
    setSecurityMeterFlag(false);
    toast("All feature flags reset to OFF");
  };

  const gameFlags = [
    {
      id: "github",
      key: "auth_github_sso",
      name: "GitHub OAuth Portal",
      enabled: githubFlag,
      toggle: () => setGithubFlag(!githubFlag),
      rules: "whitelist: dev-team",
      tag: "OAuth",
      rollout: githubFlag ? 100 : 0
    },
    {
      id: "google",
      key: "auth_google_sso",
      name: "Google Enterprise SSO",
      enabled: googleFlag,
      toggle: () => setGoogleFlag(!googleFlag),
      rules: "whitelist: workspace-users",
      tag: "OAuth",
      rollout: googleFlag ? 100 : 0
    },
    {
      id: "portal",
      key: isSignup ? "user_signup_engine" : "user_signin_engine",
      name: `${flagName} Portal Engine`,
      enabled: authPortalFlag,
      toggle: () => setAuthPortalFlag(!authPortalFlag),
      rules: "All Workspace Users",
      tag: "Core Auth",
      rollout: authPortalFlag ? 100 : 0
    },
    {
      id: "meter",
      key: "password_security_gauge",
      name: "Live Security Analyzer",
      enabled: securityMeterFlag,
      toggle: () => setSecurityMeterFlag(!securityMeterFlag),
      rules: "real-time heuristics",
      tag: "Security",
      rollout: securityMeterFlag ? 100 : 0
    }
  ];

  const unlockedCount = [
    githubFlag,
    googleFlag,
    authPortalFlag,
    securityMeterFlag
  ].filter(Boolean).length;

  const calculatePasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score += 25;
    if (/[A-Z]/.test(pass)) score += 25;
    if (/[0-9]/.test(pass)) score += 25;
    if (/[^A-Za-z0-9]/.test(pass)) score += 25;
    return score;
  };

  const passwordStrength = calculatePasswordStrength(password);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  const mutation = useMutation({
    mutationFn: async () => {
      if (isSignup) {
        const res = await api.post("/user/signup", {
          username: username,
          email: email,
          password: password,
          role: selectedRole
        });

        if (res.data.success === true) {
          const otpVerification = await api.patch(`/user/${email}`);
          if (otpVerification.data.success === true) {
            navigate(`/otp?email=${email}`);
          } else {
            toast(otpVerification.data.message || otpVerification.data.error || "OTP Couldnt be dispatched");
          }
        }

        return res.data;
      } else {
        const res = await api.post("/user/login", {
          email: email,
          password: password
        });

        return res.data;
      }
    },

    onSuccess: (data) => {
      if (data?.token) {
        localStorage.setItem("token", data.token);
        setToken(data.token);
        navigate("/home");
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
        <div className="absolute -bottom-32 left-1/3 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

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
                      FlagOps
                    </span>
                    <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      v2.4 Live
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400">
                    Enterprise Feature Management & Targeted Rollouts
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-neutral-900/90 border border-neutral-800 text-xs font-mono">
                <Gamepad2 className="size-3.5 text-emerald-400" />
                <span className="text-neutral-400">Unlocked:</span>
                <span className="text-emerald-400 font-bold">
                  {unlockedCount}/4
                </span>
              </div>
            </div>
          </div>

          <div className="w-full">
            <div className="mb-2.5">
              <div className="flex items-center justify-between mb-1.5">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-neutral-900/90 border border-neutral-800 text-xs text-neutral-300 backdrop-blur-sm">
                  <Sparkles className="size-3.5 text-emerald-400" />
                  <span>Interactive Flag Arena</span>
                </div>
                <div className="text-[11px] font-mono text-neutral-400">
                  Toggle flags to unlock UI features
                </div>
              </div>
              <h2 className="text-2xl xl:text-3xl font-bold tracking-tight text-white leading-tight mb-1">
                Toggle flags to unlock the auth flow.
              </h2>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Experience real-time targeting: turn on GitHub SSO, Google OAuth,
                the submit engine, and the security analyzer below.
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
                    onClick={resetAllFlags}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] font-mono transition-colors cursor-pointer border border-neutral-700 active:scale-95"
                    title="Reset all feature flags to OFF"
                  >
                    <RotateCcw className="size-3 text-emerald-400" />
                    <span>Reset</span>
                  </button>
                  <span className="flex items-center gap-1.5 text-[11px] text-emerald-400">
                    <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    0.8ms
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                {gameFlags.map((flag) => (
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
                      <button
                        type="button"
                        aria-label={`Toggle ${flag.name}`}
                        className="text-neutral-400 group-hover:text-white transition-colors cursor-pointer"
                      >
                        {flag.enabled ? (
                          <ToggleRight className="size-5 text-emerald-400" />
                        ) : (
                          <ToggleLeft className="size-5 text-neutral-500" />
                        )}
                      </button>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-white font-mono">
                            {flag.key}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-400 border border-neutral-700">
                            {flag.tag}
                          </span>
                        </div>
                        <div className="text-[11px] text-neutral-400 flex items-center gap-2 mt-0.5">
                          <span>{flag.rules}</span>
                          <span>•</span>
                          <span
                            className={
                              flag.enabled
                                ? "text-emerald-400 font-medium"
                                : "text-neutral-500"
                            }
                          >
                            {flag.enabled ? `${flag.rollout}% Rollout` : "Disabled"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex items-center gap-2">
                      <span
                        className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-full ${
                          flag.enabled
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : "bg-neutral-800 text-neutral-500 border border-neutral-700"
                        }`}
                      >
                        {flag.enabled ? "ACTIVE" : "LOCKED"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-2 pt-2 border-t border-neutral-800/80">
                <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 mb-1.5">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveCodeTab("sdk")}
                      className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                        activeCodeTab === "sdk"
                          ? "bg-neutral-800 text-emerald-400 font-medium"
                          : "text-neutral-500 hover:text-neutral-300"
                      }`}
                    >
                      React SDK
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveCodeTab("eval")}
                      className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                        activeCodeTab === "eval"
                          ? "bg-neutral-800 text-cyan-400 font-medium"
                          : "text-neutral-500 hover:text-neutral-300"
                      }`}
                    >
                      Evaluation JSON
                    </button>
                  </div>
                  <span className="text-[10px] text-neutral-500">
                    Live Reactive Evaluation
                  </span>
                </div>

                <div className="bg-neutral-950 rounded-lg p-2 font-mono text-xs text-neutral-300 border border-neutral-800/90 overflow-x-auto">
                  {activeCodeTab === "sdk" ? (
                    <pre className="text-[11px] leading-relaxed text-neutral-300">
                      <span className="text-purple-400">const</span> {"{"}{" "}
                      <span className="text-blue-300">githubSso</span>,{" "}
                      <span className="text-blue-300">portalAccess</span> {"}"} ={" "}
                      <span className="text-yellow-300">useFeatureFlags</span>([
                      {"\n"}  <span className="text-emerald-300">"auth_github_sso"</span>,
                      <span className="text-emerald-300">"{isSignup ? "user_signup_engine" : "user_signin_engine"}"</span>
                      {"\n"}]);{" "}
                      <span className="text-neutral-500">
                        // =&gt; github: {githubFlag ? "true" : "false"}, portal: {authPortalFlag ? "true" : "false"}
                      </span>
                    </pre>
                  ) : (
                    <pre className="text-[11px] leading-relaxed text-neutral-300">
                      {"{\n"}
                      {`  "auth_github_sso": ${githubFlag},\n`}
                      {`  "auth_google_sso": ${googleFlag},\n`}
                      {`  "${isSignup ? "user_signup_engine" : "user_signin_engine"}": ${authPortalFlag},\n`}
                      {`  "password_security_gauge": ${securityMeterFlag}\n`}
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
              <GitBranch className="size-3.5 text-cyan-400" />
              <span>Zero Downtime</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-purple-400" />
              <span>SOC2 Compliant</span>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-5/12 flex flex-col justify-between p-6 xl:p-8 h-full overflow-y-auto lg:overflow-hidden">
        <div className="flex lg:hidden items-center justify-between pb-3 mb-2 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center size-8 rounded-lg bg-linear-to-br from-emerald-400 to-teal-600 text-neutral-950 font-bold shadow-md">
              <Flag className="size-4 fill-neutral-950 stroke-neutral-950" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              FlagOps
            </span>
          </div>
          <span className="text-[11px] font-mono text-neutral-400 bg-neutral-900 px-2 py-1 rounded border border-neutral-800">
            {isSignup ? "Create Account" : "Sign In"}
          </span>
        </div>

        <div className="my-auto max-w-md w-full mx-auto py-1">
          <div className="mb-3">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-1">
              {isSignup ? "Create your workspace account" : "Welcome back to FlagOps"}
            </h1>
            <p className="text-xs text-neutral-400">
              {isSignup
                ? "Start releasing software safely with granular feature flags."
                : "Enter your credentials to access your flag control center."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5 mb-3">
            <button
              type="button"
              disabled={!githubFlag}
              onClick={() => toast("GitHub SSO triggered")}
              className={`flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-medium transition-all shadow-sm active:scale-[0.98] ${
                githubFlag
                  ? "bg-neutral-900/90 hover:bg-neutral-800 text-neutral-200 border-neutral-700 cursor-pointer shadow-emerald-500/10"
                  : "bg-neutral-950 border-neutral-800/80 text-neutral-600 opacity-50 cursor-not-allowed"
              }`}
            >
              <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                />
              </svg>
              <span>GitHub</span>
              {!githubFlag && <Lock className="size-3 text-neutral-600" />}
              {githubFlag && <Unlock className="size-3 text-emerald-400" />}
            </button>

            <button
              type="button"
              disabled={!googleFlag}
              onClick={() => toast("Google SSO triggered")}
              className={`flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-medium transition-all shadow-sm active:scale-[0.98] ${
                googleFlag
                  ? "bg-neutral-900/90 hover:bg-neutral-800 text-neutral-200 border-neutral-700 cursor-pointer shadow-emerald-500/10"
                  : "bg-neutral-950 border-neutral-800/80 text-neutral-600 opacity-50 cursor-not-allowed"
              }`}
            >
              <svg className="size-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.56 0 2.97.57 4.07 1.5l3.05-3.05C17.26 1.7 14.81 1 12 1 7.37 1 3.44 3.65 1.54 7.51l3.66 2.84C6.07 7.42 8.78 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58l3.71 2.88c2.16-2 3.71-4.94 3.71-8.7z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.2 14.65c-.24-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29L1.54 7.23C.56 9.17 0 11.36 0 13.64c0 2.29.56 4.47 1.54 6.42l3.66-2.85z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.24 0 5.95-1.08 7.93-2.91l-3.71-2.88c-1.07.72-2.44 1.16-4.22 1.16-3.22 0-5.93-2.42-6.8-5.35L1.54 15.86C3.44 19.72 7.37 23 12 23z"
                />
              </svg>
              <span>Google SSO</span>
              {!googleFlag && <Lock className="size-3 text-neutral-600" />}
              {googleFlag && <Unlock className="size-3 text-emerald-400" />}
            </button>
          </div>

          <div className="relative flex items-center justify-center mb-3">
            <div className="border-t border-neutral-800 w-full" />
            <span className="bg-neutral-950 px-3 text-[10px] uppercase tracking-wider text-neutral-500 font-mono">
              Or email credentials
            </span>
          </div>

          {errorMessage && (
            <div className="mb-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="size-4 shrink-0 text-rose-400 mt-0.5" />
              <div className="leading-tight">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-2.5">
            {isSignup && (
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Developer / Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                    <User className="size-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="ronak_developer"
                    className="w-full pl-10 pr-3.5 py-2 bg-neutral-900/90 border border-neutral-800 rounded-xl text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                  />
                </div>
              </div>
            )}

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

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-neutral-300">
                  Password
                </label>
                {!isSignup && (
                  <Link
                    to="/forgot-password"
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    Forgot password?
                  </Link>
                )}
              </div>
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
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>

              {isSignup && password.length > 0 && securityMeterFlag && (
                <div className="mt-1.5 space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-neutral-400 font-mono">
                      Security Score (Flag: Active)
                    </span>
                    <span
                      className={`font-medium ${
                        passwordStrength <= 25
                          ? "text-rose-400"
                          : passwordStrength <= 50
                          ? "text-amber-400"
                          : passwordStrength <= 75
                          ? "text-cyan-400"
                          : "text-emerald-400"
                      }`}
                    >
                      {passwordStrength <= 25
                        ? "Weak"
                        : passwordStrength <= 50
                        ? "Fair"
                        : passwordStrength <= 75
                        ? "Strong"
                        : "Very Strong"}
                    </span>
                  </div>
                  <div className="h-1 w-full bg-neutral-900 rounded-full overflow-hidden flex gap-1">
                    <div
                      className={`h-full transition-all duration-300 rounded-full ${
                        passwordStrength >= 25 ? "bg-rose-500" : "bg-neutral-800"
                      }`}
                      style={{ width: "25%" }}
                    />
                    <div
                      className={`h-full transition-all duration-300 rounded-full ${
                        passwordStrength >= 50 ? "bg-amber-500" : "bg-neutral-800"
                      }`}
                      style={{ width: "25%" }}
                    />
                    <div
                      className={`h-full transition-all duration-300 rounded-full ${
                        passwordStrength >= 75 ? "bg-cyan-500" : "bg-neutral-800"
                      }`}
                      style={{ width: "25%" }}
                    />
                    <div
                      className={`h-full transition-all duration-300 rounded-full ${
                        passwordStrength >= 100 ? "bg-emerald-500" : "bg-neutral-800"
                      }`}
                      style={{ width: "25%" }}
                    />
                  </div>
                </div>
              )}
            </div>

            {isSignup && (
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Primary Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "USER", label: "Developer", icon: Code2 },
                    { id: "ADMIN", label: "DevOps / SRE", icon: Layers }
                  ].map((role) => {
                    const Icon = role.icon;
                    const isSelected = selectedRole === role.id;
                    return (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => setSelectedRole(role.id)}
                        className={`flex flex-col items-center justify-center p-1.5 rounded-xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300"
                            : "bg-neutral-900/60 border-neutral-800/80 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200"
                        }`}
                      >
                        <Icon className="size-3.5 mb-0.5" />
                        <span className="text-[11px] font-medium">{role.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {!isSignup && (
              <div className="flex items-center justify-between pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className={`size-3.5 rounded border flex items-center justify-center transition-all ${
                      rememberMe
                        ? "bg-emerald-500 border-emerald-500 text-neutral-950"
                        : "border-neutral-700 bg-neutral-900"
                    }`}
                  >
                    {rememberMe && <Check className="size-2.5 stroke-[3]" />}
                  </div>
                  <span className="text-xs text-neutral-400">
                    Keep me signed in on this device
                  </span>
                </label>
              </div>
            )}

            {isSignup && (
              <div className="flex items-start gap-1.5 pt-0.5 text-[10px] text-neutral-400">
                <CheckCircle2 className="size-3 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  By registering, you agree to the Feature Governance Terms &
                  Privacy Policy.
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={!authPortalFlag || mutation.isPending || isLoading}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-neutral-950 font-semibold text-xs transition-all shadow-lg shadow-emerald-500/15 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none cursor-pointer mt-1.5"
            >
              {mutation.isPending || isLoading ? (
                <div className="size-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>
                    {isSignup ? "Create Free Workspace" : "Sign In to Console"}
                  </span>
                  <ArrowRight className="size-4" />
                </>
              )}
            </button>
            {!authPortalFlag && (
              <p className="text-xs text-center text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl py-1.5 px-3 mt-1.5 font-medium flex items-center justify-center gap-1.5">
                <AlertCircle className="size-3.5 shrink-0" />
                <span>
                  Toggle <strong>{isSignup ? "user_signup_engine" : "user_signin_engine"}</strong> on the left to unlock {flagName}
                </span>
              </p>
            )}
          </form>

          <div className="text-center mt-3 pt-3 border-t border-neutral-900">
            <p className="text-xs text-neutral-400">
              {isSignup ? (
                <>
                  Already registered your workspace?{" "}
                  <Link
                    to="/signin"
                    className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
                  >
                    Sign in here
                  </Link>
                </>
              ) : (
                <>
                  Don't have a FlagOps account?{" "}
                  <Link
                    to="/signup"
                    className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
                  >
                    Create a free workspace
                  </Link>
                </>
              )}
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

export default AuthCard;