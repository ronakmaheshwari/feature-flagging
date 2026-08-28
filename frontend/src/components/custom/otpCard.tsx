import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Flag,
  ShieldCheck,
  KeyRound,
  Zap,
  Mail,
  ArrowRight,
  RotateCcw,
  Sliders,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Fingerprint,
  Gamepad2,
  Copy,
  Check,
  RefreshCw,
  Timer,
  Cpu
} from "lucide-react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "./authContext";
import api from "@/lib/api";

interface OtpCardProps {
  isLoading?: boolean;
  errorMessage?: string | null;
  onVerify?: (otp: string, email: string) => void;
  onResend?: (email: string) => void;
}

const OtpCard = ({
  isLoading = false,
  errorMessage = null,
  onVerify,
  onResend,
}: OtpCardProps) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const {setToken} = useAuth();
  const rawEmail = searchParams.get("email") || "ronak@flagops.dev";

  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [autoFillFlag, setAutoFillFlag] = useState<boolean>(false);
  const [cooldownBypassFlag, setCooldownBypassFlag] = useState<boolean>(false);
  const [biometricFlag, setBiometricFlag] = useState<boolean>(false);
  const [telemetryAuditFlag, setTelemetryAuditFlag] = useState<boolean>(true);

  const [activeConsoleTab, setActiveConsoleTab] = useState<"sdk" | "telemetry" | "rules">("sdk");
  const [cooldown, setCooldown] = useState<number>(60);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [quantumToken, setQuantumToken] = useState<string>("739281");

  useEffect(() => {
    if (cooldownBypassFlag) {
      setCooldown(0);
      return;
    }

    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown, cooldownBypassFlag]);

  const fullOtp = otpDigits.join("");
  const isComplete = otpDigits.every((d) => d !== "");
  const activeDigitsCount = otpDigits.filter(Boolean).length;

  const handleDigitChange = (index: number, value: string) => {
    const numericVal = value.replace(/\D/g, "");
    if (!numericVal && value !== "") return;

    const newDigits = [...otpDigits];

    if (numericVal.length > 1) {
      const pasted = numericVal.slice(0, 6).split("");
      pasted.forEach((char, i) => {
        if (index + i < 6) {
          newDigits[index + i] = char;
        }
      });
      setOtpDigits(newDigits);
      const nextIndex = Math.min(index + pasted.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    newDigits[index] = numericVal;
    setOtpDigits(newDigits);

    if (numericVal && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pastedData) return;

    const newDigits = [...otpDigits];
    pastedData.split("").forEach((char, i) => {
      newDigits[i] = char;
    });
    setOtpDigits(newDigits);
    const targetIdx = Math.min(pastedData.length, 5);
    inputRefs.current[targetIdx]?.focus();
    toast.success(`Injected ${pastedData.length} digits from clipboard`);
  };

  const injectQuantumToken = () => {
    const chars = quantumToken.split("");
    setOtpDigits(chars);
    inputRefs.current[5]?.focus();
    toast.success(`Quantum Decoder Auto-Injected: ${quantumToken}`);
  };

  const generateNewQuantumToken = () => {
    const rand = Math.floor(100000 + Math.random() * 900000).toString();
    setQuantumToken(rand);
    toast("Generated new simulated Quantum Test Key: " + rand);
  };

  const handleResend = () => {
    if (cooldown > 0 && !cooldownBypassFlag) return;

    if (onResend) {
      onResend(rawEmail);
    } else {
      toast.success(`New 6-digit authentication token dispatched to ${rawEmail}`);
    }

    if (!cooldownBypassFlag) {
      setCooldown(60);
    }
  };

  const handleResetFlags = () => {
    setAutoFillFlag(false);
    setCooldownBypassFlag(false);
    setBiometricFlag(false);
    setTelemetryAuditFlag(false);
    setOtpDigits(["", "", "", "", "", ""]);
    setCooldown(60);
    inputRefs.current[0]?.focus();
    toast("All security feature flags & inputs reset to baseline");
  };

  const copyEmail = () => {
    navigator.clipboard.writeText(rawEmail);
    setIsCopied(true);
    toast.success("Email copied to clipboard");
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isComplete) {
      toast.error("Please enter all 6 digits of your verification token");
      return;
    }

    if (onVerify) {
      //onVerify(fullOtp, rawEmail);
      mutation.mutate()
    } else {
      toast.success(`Token [${fullOtp}] submitted for verification`);
    }
  };

  const handleBiometricAuth = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1200)),
      {
        loading: "Querying WebAuthn Hardware Security Enclave...",
        success: () => {
          injectQuantumToken();
          return "Biometric Passkey Verified! Token Auto-Populated.";
        },
        error: "Biometric validation failed"
      }
    );
  };

  const securityFlags = [
    {
      id: "quantum_autofill",
      key: "quantum_otp_decoder",
      name: "Quantum Token Decoder",
      enabled: autoFillFlag,
      toggle: () => setAutoFillFlag(!autoFillFlag),
      rules: "whitelist: dev-testers",
      tag: "Dev Tool",
      description: "Generates and auto-injects 1-click test tokens."
    },
    {
      id: "cooldown_bypass",
      key: "rate_limit_cooldown_bypass",
      name: "Zero Rate-Limit Warp",
      enabled: cooldownBypassFlag,
      toggle: () => setCooldownBypassFlag(!cooldownBypassFlag),
      rules: "enterprise-tier: sla-0",
      tag: "Ops Rule",
      description: "Overrides 60s cooldown for rapid re-dispatches."
    },
    {
      id: "biometric_fast_track",
      key: "webauthn_passkey_enclave",
      name: "Biometric Fast-Track",
      enabled: biometricFlag,
      toggle: () => setBiometricFlag(!biometricFlag),
      rules: "FIDO2 / TouchID Hardware",
      tag: "Security",
      description: "Unlocks 1-tap hardware biometric validation."
    },
    {
      id: "telemetry_stream",
      key: "tamper_evident_telemetry",
      name: "Edge Audit Stream",
      enabled: telemetryAuditFlag,
      toggle: () => setTelemetryAuditFlag(!telemetryAuditFlag),
      rules: "SOC2 Compliance Enforced",
      tag: "Audit",
      description: "Streams cryptographic session telemetry."
    }
  ];

  const unlockedCount = [
    autoFillFlag,
    cooldownBypassFlag,
    biometricFlag,
    telemetryAuditFlag
  ].filter(Boolean).length;

  const mutation = useMutation({
    mutationFn: async () => {
        const res = await api.patch(`/user/otp-verification?email=${rawEmail}&otp=${fullOtp}`);
        return res.data
    },
    onSuccess: (data) => {
      if(data.success === true) {
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
        <div className="absolute -bottom-32 left-1/3 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

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
                      FlagOps Vault
                    </span>
                    <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      MFA Enclave
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400">
                    Cryptographic 2FA & Edge Rule Evaluation
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-neutral-900/90 border border-neutral-800 text-xs font-mono">
                <Gamepad2 className="size-3.5 text-emerald-400" />
                <span className="text-neutral-400">Security Flags:</span>
                <span className="text-emerald-400 font-bold">
                  {unlockedCount}/4
                </span>
              </div>
            </div>
          </div>

          <div className="w-full my-auto py-2">
            <div className="mb-2.5">
              <div className="flex items-center justify-between mb-1.5">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-neutral-900/90 border border-neutral-800 text-xs text-neutral-300 backdrop-blur-sm">
                  <Sparkles className="size-3.5 text-emerald-400" />
                  <span>Security Flag Arena</span>
                </div>
                <div className="text-[11px] font-mono text-neutral-400">
                  Interactive Verification Protocol
                </div>
              </div>
              <h2 className="text-2xl xl:text-3xl font-bold tracking-tight text-white leading-tight mb-1">
                Zero-Trust Token Verification Enclave.
              </h2>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Experience real-time rule orchestration: toggle Quantum decoding,
                rate-limit overrides, WebAuthn biometric fast-track, and audit telemetry.
              </p>
            </div>

            <div className="bg-neutral-900/80 rounded-2xl border border-neutral-800 shadow-2xl p-3 backdrop-blur-md">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-800/80 text-xs text-neutral-400 font-mono">
                <div className="flex items-center gap-2">
                  <Sliders className="size-3.5 text-emerald-400" />
                  <span>MFA PROTOCOL TOGGLES (Click to Test)</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetFlags}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] font-mono transition-colors cursor-pointer border border-neutral-700 active:scale-95"
                    title="Reset all feature flags and inputs"
                  >
                    <RotateCcw className="size-3 text-emerald-400" />
                    <span>Reset</span>
                  </button>
                  <span className="flex items-center gap-1.5 text-[11px] text-emerald-400">
                    <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    0.4ms Edge
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                {securityFlags.map((flag) => (
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
                          <CheckCircle2 className="size-5 text-emerald-400" />
                        ) : (
                          <div className="size-5 rounded-full border border-neutral-600 flex items-center justify-center text-[10px] text-neutral-500">
                            ○
                          </div>
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
                          <span>{flag.description}</span>
                          <span>•</span>
                          <span
                            className={
                              flag.enabled
                                ? "text-emerald-400 font-medium"
                                : "text-neutral-500"
                            }
                          >
                            {flag.enabled ? "ACTIVE" : "STANDBY"}
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
                        {flag.enabled ? "ENABLED" : "OFF"}
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
                      onClick={() => setActiveConsoleTab("sdk")}
                      className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                        activeConsoleTab === "sdk"
                          ? "bg-neutral-800 text-emerald-400 font-medium"
                          : "text-neutral-500 hover:text-neutral-300"
                      }`}
                    >
                      SDK Evaluation
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveConsoleTab("telemetry")}
                      className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                        activeConsoleTab === "telemetry"
                          ? "bg-neutral-800 text-cyan-400 font-medium"
                          : "text-neutral-500 hover:text-neutral-300"
                      }`}
                    >
                      Audit Telemetry
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveConsoleTab("rules")}
                      className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                        activeConsoleTab === "rules"
                          ? "bg-neutral-800 text-purple-400 font-medium"
                          : "text-neutral-500 hover:text-neutral-300"
                      }`}
                    >
                      Security Rules
                    </button>
                  </div>
                  <span className="text-[10px] text-neutral-500">
                    Entropy: 99.98%
                  </span>
                </div>

                <div className="bg-neutral-950 rounded-lg p-2 font-mono text-xs text-neutral-300 border border-neutral-800/90 overflow-x-auto">
                  {activeConsoleTab === "sdk" && (
                    <pre className="text-[11px] leading-relaxed text-neutral-300">
                      <span className="text-purple-400">const</span> {"{"}{" "}
                      <span className="text-blue-300">allowPasskey</span>,{" "}
                      <span className="text-blue-300">bypassCooldown</span> {"}"} ={" "}
                      <span className="text-yellow-300">useSecurityFlags</span>({"{"}
                      {"\n"}  session: <span className="text-emerald-300">"mfa_tok_9918"</span>,
                      {"\n"}  target: <span className="text-emerald-300">"{rawEmail}"</span>
                      {"\n"}{"}"});{" "}
                      <span className="text-neutral-500">
                        // =&gt; passkey: {biometricFlag ? "true" : "false"}, bypass: {cooldownBypassFlag ? "true" : "false"}
                      </span>
                    </pre>
                  )}

                  {activeConsoleTab === "telemetry" && (
                    <pre className="text-[11px] leading-relaxed text-neutral-300">
                      {"{\n"}
                      {`  "target_email": "${rawEmail}",\n`}
                      {`  "quantum_autofill": ${autoFillFlag},\n`}
                      {`  "cooldown_bypass": ${cooldownBypassFlag},\n`}
                      {`  "webauthn_passkey": ${biometricFlag},\n`}
                      {`  "entered_digits": "${fullOtp || "NONE"}",\n`}
                      {`  "status": "${isComplete ? "TOKEN_READY_FOR_DISPATCH" : "AWAITING_USER_INPUT"}"\n`}
                      {"}"}
                    </pre>
                  )}

                  {activeConsoleTab === "rules" && (
                    <pre className="text-[11px] leading-relaxed text-neutral-300">
                      <span className="text-neutral-500">// Real-time targeting rule evaluation:</span>{"\n"}
                      <span className="text-purple-400">rule</span> MFA_THROTTLE: cooldown &lt;= 0s OR bypass == <span className="text-emerald-400">{cooldownBypassFlag ? "TRUE" : "FALSE"}</span>;{"\n"}
                      <span className="text-purple-400">rule</span> WEBAUTHN_ENCLAVE: fido2_hardware == <span className="text-emerald-400">{biometricFlag ? "MOUNTED" : "UNAVAILABLE"}</span>;
                    </pre>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="w-full pt-3 border-t border-neutral-900 flex items-center justify-between text-xs text-neutral-400">
            <div className="flex items-center gap-1.5">
              <Zap className="size-3.5 text-emerald-400" />
              <span>Microsecond Rule Evaluation</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Cpu className="size-3.5 text-cyan-400" />
              <span>Hardware MFA Level 3</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-purple-400" />
              <span>FIPS 140-3 Validated</span>
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
              FlagOps Vault
            </span>
          </div>
          <span className="text-[11px] font-mono text-neutral-400 bg-neutral-900 px-2 py-1 rounded border border-neutral-800">
            MFA Challenge
          </span>
        </div>

        <div className="my-auto max-w-md w-full mx-auto py-1">
          <div className="mb-3 text-center sm:text-left">
            <div className="inline-flex items-center justify-center size-12 rounded-2xl bg-linear-to-br from-emerald-400/20 to-teal-600/20 text-emerald-400 border border-emerald-500/30 mb-2 shadow-inner">
              <KeyRound className="size-6" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-1">
              Verify Security Token
            </h1>
            <p className="text-xs text-neutral-400 leading-relaxed">
              We've dispatched a 6-digit one-time authorization token to verify your identity.
            </p>

            <div className="mt-2.5 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-200">
              <Mail className="size-3.5 text-emerald-400 shrink-0" />
              <span className="font-mono truncate max-w-[200px] sm:max-w-[240px]">
                {rawEmail}
              </span>
              <button
                type="button"
                onClick={copyEmail}
                className="text-neutral-400 hover:text-white transition-colors cursor-pointer p-0.5"
                title="Copy email address"
              >
                {isCopied ? (
                  <Check className="size-3.5 text-emerald-400" />
                ) : (
                  <Copy className="size-3.5" />
                )}
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="mb-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="size-4 shrink-0 text-rose-400 mt-0.5" />
              <div className="leading-tight">{errorMessage}</div>
            </div>
          )}

          {autoFillFlag && (
            <div className="mb-3 p-2.5 rounded-xl bg-linear-to-r from-emerald-500/15 to-cyan-500/15 border border-emerald-500/30 text-xs flex items-center justify-between animate-in fade-in zoom-in duration-300">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-semibold text-emerald-300 font-mono text-[11px]">
                    QUANTUM DECODER ACTIVE
                  </div>
                  <div className="text-[11px] text-neutral-300">
                    Test Token:{" "}
                    <span className="font-mono font-bold tracking-widest text-white">
                      {quantumToken}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={generateNewQuantumToken}
                  className="p-1 rounded-lg bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 border border-neutral-700 text-[10px] cursor-pointer"
                  title="Generate new token"
                >
                  <RefreshCw className="size-3" />
                </button>
                <button
                  type="button"
                  onClick={injectQuantumToken}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500 text-neutral-950 font-bold text-[11px] hover:bg-emerald-400 transition-colors shadow-sm cursor-pointer"
                >
                  Inject
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleVerifySubmit} className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-neutral-300">
                  Authentication Token (6 Digits)
                </label>
                <span className="text-[11px] font-mono text-neutral-400">
                  {activeDigitsCount}/6 Digits
                </span>
              </div>

              <div className="grid grid-cols-6 gap-2 sm:gap-2.5" onPaste={handlePaste}>
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className={`w-full aspect-square sm:h-13 text-center text-lg sm:text-xl font-bold font-mono rounded-xl border transition-all outline-none select-none ${
                      digit
                        ? "bg-neutral-900 border-emerald-500/70 text-emerald-300 shadow-sm shadow-emerald-500/10"
                        : "bg-neutral-900/60 border-neutral-800 text-white focus:border-emerald-500/80 focus:ring-2 focus:ring-emerald-500/30"
                    }`}
                  />
                ))}
              </div>

              <div className="mt-2 h-1 w-full bg-neutral-900 rounded-full overflow-hidden flex gap-1">
                {[0, 1, 2, 3, 4, 5].map((idx) => (
                  <div
                    key={idx}
                    className={`h-full flex-1 transition-all duration-200 rounded-full ${
                      idx < activeDigitsCount ? "bg-emerald-500" : "bg-neutral-800"
                    }`}
                  />
                ))}
              </div>
            </div>

            {biometricFlag && (
              <button
                type="button"
                onClick={handleBiometricAuth}
                className="w-full flex items-center justify-center gap-2 py-2 px-3.5 rounded-xl border border-neutral-800 bg-neutral-900/90 hover:bg-neutral-800/80 text-xs font-medium text-neutral-200 transition-all shadow-sm hover:border-emerald-500/40 active:scale-[0.98] cursor-pointer"
              >
                <Fingerprint className="size-4 text-emerald-400" />
                <span>Verify with WebAuthn Passkey / TouchID</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                  1-Tap
                </span>
              </button>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-neutral-950 font-semibold text-xs transition-all shadow-lg shadow-emerald-500/15 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none cursor-pointer mt-1"
            >
              {isLoading ? (
                <div className="size-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Authenticate & Enter Workspace</span>
                  <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-3 pt-3 border-t border-neutral-900 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-neutral-400">
              <Timer className="size-3.5 text-neutral-500" />
              {cooldownBypassFlag ? (
                <span className="text-emerald-400 font-mono text-[11px]">
                  ⚡ Rate-limit bypass active
                </span>
              ) : cooldown > 0 ? (
                <span>
                  Resend token in{" "}
                  <strong className="text-white font-mono">{cooldown}s</strong>
                </span>
              ) : (
                <span>Didn't receive the token?</span>
              )}
            </div>

            <button
              type="button"
              onClick={handleResend}
              disabled={cooldown > 0 && !cooldownBypassFlag}
              className={`font-semibold transition-colors ${
                cooldown === 0 || cooldownBypassFlag
                  ? "text-emerald-400 hover:text-emerald-300 cursor-pointer"
                  : "text-neutral-600 cursor-not-allowed"
              }`}
            >
              Resend Token
            </button>
          </div>

          <div className="text-center mt-3 pt-2">
            <p className="text-xs text-neutral-400">
              Entered the wrong email address?{" "}
              <Link
                to="/signup"
                className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
              >
                Return to Signup
              </Link>
              {" or "}
              <Link
                to="/signin"
                className="text-neutral-400 hover:text-white transition-colors"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>

        <div className="text-center pt-2 border-t border-neutral-900 text-[10px] text-neutral-500 flex items-center justify-center gap-4">
          <span className="flex items-center gap-1">
            <ShieldCheck className="size-3 text-neutral-400" />
            TLS 1.3 End-to-End Encryption
          </span>
          <span>•</span>
          <span>Zero-Trust Token Enclave</span>
        </div>
      </div>
    </div>
  );
};

export default OtpCard;