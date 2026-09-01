"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, Users, UserMinus, UserPlus, Settings, Trash2, Eye, Edit, Globe, Route } from "lucide-react";
import type { FeatureFlag, FeatureFlagDetail } from "@/lib/api-services";

interface FlagCardProps {
  flag: FeatureFlag | FeatureFlagDetail | any;
  variant?: "compact" | "detailed";
  showActions?: boolean;
  onToggle?: (flagId: string, enabled: boolean) => void;
  onEdit?: (flag: any) => void;
  onDelete?: (flagId: string) => void;
  onViewDetails?: (flag: any) => void;
  onManageRules?: (flag: any) => void;
  loading?: boolean;
}

export function FlagCard({
  flag,
  variant = "detailed",
  showActions = true,
  onToggle,
  onEdit,
  onDelete,
  onViewDetails,
  onManageRules,
  loading = false,
}: FlagCardProps) {
  const rawFlag = flag as any;
  const rules = rawFlag?.rules ?? {};

  // Extract whitelist items
  const rawWhitelist: any[] = Array.isArray(rawFlag?.whitelist)
    ? rawFlag.whitelist
    : Array.isArray(rules?.whitelist)
    ? rules.whitelist
    : [];
  const whitelistCount = rawWhitelist.length;

  // Extract blacklist items
  const rawBlacklist: any[] = Array.isArray(rawFlag?.blacklist)
    ? rawFlag.blacklist
    : Array.isArray(rules?.blacklist)
    ? rules.blacklist
    : [];
  const blacklistCount = rawBlacklist.length;

  // Extract groups items
  const rawGroups: any[] = Array.isArray(rawFlag?.groups)
    ? rawFlag.groups
    : Array.isArray(rules?.groups)
    ? rules.groups
    : [];
  const groupsCount = rawGroups.length;

  // Extract rollout percentage (falls back to flag.rollout or rules.rollout, default 0)
  const rollout = typeof rawFlag?.rollout === "number"
    ? rawFlag.rollout
    : typeof rules?.rollout === "number"
    ? rules.rollout
    : 0;

  const routes: any[] = Array.isArray(rawFlag?.routes) ? rawFlag.routes : [];
  const isEnabled = Boolean(rawFlag?.is_enabled);

  const getStatusBadge = () => {
    if (!isEnabled) {
      return (
        <Badge variant="destructive" className="font-mono text-[11px] px-2 py-0.5">
          Disabled
        </Badge>
      );
    }
    if (rollout > 0 && rollout < 100) {
      return (
        <Badge className="bg-amber-500/15 text-amber-500 border border-amber-500/30 font-mono text-[11px] px-2 py-0.5">
          Rollout {rollout}%
        </Badge>
      );
    }
    if (whitelistCount > 0 || blacklistCount > 0 || groupsCount > 0) {
      return (
        <Badge className="bg-blue-500/15 text-blue-400 border border-blue-500/30 font-mono text-[11px] px-2 py-0.5">
          Targeted
        </Badge>
      );
    }
    return (
      <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono text-[11px] px-2 py-0.5">
        Enabled (100%)
      </Badge>
    );
  };

  const getEnvironmentBadge = () => {
    return rawFlag.environment === "PRODUCTION" ? (
      <Badge variant="destructive" className="font-mono text-[11px] px-2 py-0.5">
        PRODUCTION
      </Badge>
    ) : (
      <Badge variant="secondary" className="font-mono text-[11px] px-2 py-0.5">
        DEVELOPMENT
      </Badge>
    );
  };

  if (variant === "compact") {
    return (
      <Card className="flex flex-row items-center gap-3 p-3 hover:bg-muted/30 transition-colors border-border">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <CardTitle className="font-mono text-sm truncate">{rawFlag.name}</CardTitle>
            {getStatusBadge()}
            {getEnvironmentBadge()}
          </div>
          <CardDescription className="text-xs truncate mt-1 text-muted-foreground">
            Rollout: {rollout}% | Whitelist: {whitelistCount} | Blacklist: {blacklistCount} | Groups: {groupsCount}
          </CardDescription>
        </div>
        {showActions && (
          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onViewDetails?.(rawFlag)}
              disabled={loading}
              className="h-8 w-8 cursor-pointer"
              title="View details"
            >
              <Eye className="size-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onEdit?.(rawFlag)}
              disabled={loading}
              className="h-8 w-8 cursor-pointer"
              title="Edit flag"
            >
              <Edit className="size-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onManageRules?.(rawFlag)}
              disabled={loading}
              className="h-8 w-8 cursor-pointer"
              title="Manage rules"
            >
              <Settings className="size-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onDelete?.(rawFlag.id)}
              disabled={loading}
              className="h-8 w-8 text-destructive hover:text-destructive cursor-pointer"
              title="Delete flag"
            >
              <Trash2 className="size-3.5" />
            </Button>

            {/* Toggle switch */}
            <button
              type="button"
              role="switch"
              aria-checked={isEnabled}
              onClick={() => onToggle?.(rawFlag.id, !isEnabled)}
              disabled={loading}
              title={isEnabled ? "Click to disable flag" : "Click to enable flag"}
              className={`relative ml-1 inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                isEnabled ? "bg-emerald-500" : "bg-neutral-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block size-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  isEnabled ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        )}
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-border/80 bg-card/60 backdrop-blur-sm hover:border-border transition-all">
      <CardHeader className="pb-3 pt-4 px-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <CardTitle className="font-mono text-base font-semibold truncate text-foreground">
                {rawFlag.name}
              </CardTitle>
              {getStatusBadge()}
              {getEnvironmentBadge()}
            </div>
            <CardDescription className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
              <span>ID: <code className="text-[11px] font-mono text-muted-foreground">{rawFlag.id?.slice(0, 8)}...</code></span>
              <span>•</span>
              <span>Updated: {rawFlag.updatedAt ? new Date(rawFlag.updatedAt).toLocaleDateString() : "Recently"}</span>
            </CardDescription>
          </div>

          {showActions && (
            <div className="flex items-center gap-1 shrink-0">
              {/* Toggle switch */}
              <button
                type="button"
                role="switch"
                aria-checked={isEnabled}
                onClick={() => onToggle?.(rawFlag.id, !isEnabled)}
                disabled={loading}
                title={isEnabled ? "Click to disable flag" : "Click to enable flag"}
                className={`relative mr-1.5 inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                  isEnabled ? "bg-emerald-500" : "bg-neutral-700"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block size-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    isEnabled ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => onViewDetails?.(rawFlag)}
                disabled={loading}
                className="h-8 w-8 hover:bg-muted cursor-pointer"
                title="View details"
              >
                <Eye className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit?.(rawFlag)}
                disabled={loading}
                className="h-8 w-8 hover:bg-muted cursor-pointer"
                title="Edit flag"
              >
                <Edit className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onManageRules?.(rawFlag)}
                disabled={loading}
                className="h-8 w-8 hover:bg-muted cursor-pointer"
                title="Manage rules"
              >
                <Settings className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete?.(rawFlag.id)}
                disabled={loading}
                className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                title="Delete flag"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-4 pt-0 space-y-3">
        {/* Rollout bar & Counters */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 p-3 rounded-lg bg-muted/20 border border-border/50">
          <div>
            <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Rollout</div>
            <div className="flex items-center gap-2">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    rollout === 100
                      ? "bg-emerald-500"
                      : rollout > 0
                      ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                      : "bg-neutral-600"
                  }`}
                  style={{ width: `${Math.min(100, Math.max(0, rollout))}%` }}
                />
              </div>
              <span className="text-xs font-semibold tabular-nums text-foreground">{rollout}%</span>
            </div>
          </div>
          <div>
            <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Whitelist</div>
            <div className="flex items-center gap-1.5">
              <UserPlus className="size-3.5 text-emerald-400" />
              <span className="font-semibold text-xs">{whitelistCount} user{whitelistCount !== 1 ? "s" : ""}</span>
            </div>
          </div>
          <div>
            <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Blacklist</div>
            <div className="flex items-center gap-1.5">
              <UserMinus className="size-3.5 text-rose-400" />
              <span className="font-semibold text-xs">{blacklistCount} user{blacklistCount !== 1 ? "s" : ""}</span>
            </div>
          </div>
          <div>
            <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Groups</div>
            <div className="flex items-center gap-1.5">
              <Users className="size-3.5 text-blue-400" />
              <span className="font-semibold text-xs">{groupsCount} group{groupsCount !== 1 ? "s" : ""}</span>
            </div>
          </div>
        </div>

        {/* Detailed tags preview */}
        {(whitelistCount > 0 || blacklistCount > 0 || groupsCount > 0 || routes.length > 0) && (
          <div className="space-y-2 pt-2 border-t border-border/40 text-xs">
            {whitelistCount > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 text-emerald-400 text-[11px] font-medium">
                  <Check className="size-3" />
                  <span>Whitelisted:</span>
                </span>
                {rawWhitelist.slice(0, 4).map((user: any, i: number) => {
                  const label = typeof user === "string" ? user : user.username || user.userId || `User ${i + 1}`;
                  return (
                    <Badge key={i} variant="outline" className="border-emerald-500/30 text-emerald-400 text-[10px] px-1.5 py-0">
                      {label}
                    </Badge>
                  );
                })}
                {rawWhitelist.length > 4 && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                    +{rawWhitelist.length - 4} more
                  </Badge>
                )}
              </div>
            )}

            {blacklistCount > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 text-rose-400 text-[11px] font-medium">
                  <X className="size-3" />
                  <span>Blacklisted:</span>
                </span>
                {rawBlacklist.slice(0, 4).map((user: any, i: number) => {
                  const label = typeof user === "string" ? user : user.username || user.userId || `User ${i + 1}`;
                  return (
                    <Badge key={i} variant="destructive" className="text-[10px] px-1.5 py-0">
                      {label}
                    </Badge>
                  );
                })}
                {rawBlacklist.length > 4 && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                    +{rawBlacklist.length - 4} more
                  </Badge>
                )}
              </div>
            )}

            {groupsCount > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 text-blue-400 text-[11px] font-medium">
                  <Globe className="size-3" />
                  <span>Groups:</span>
                </span>
                {rawGroups.slice(0, 4).map((group: any, i: number) => {
                  const label = typeof group === "string" ? group : group.name || group.id || `Group ${i + 1}`;
                  return (
                    <Badge key={i} className="bg-blue-500/15 text-blue-400 border border-blue-500/30 text-[10px] px-1.5 py-0">
                      {label}
                    </Badge>
                  );
                })}
                {rawGroups.length > 4 && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                    +{rawGroups.length - 4} more
                  </Badge>
                )}
              </div>
            )}

            {routes.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 text-purple-400 text-[11px] font-medium">
                  <Route className="size-3" />
                  <span>Linked Routes:</span>
                </span>
                {routes.slice(0, 3).map((route: any, i: number) => (
                  <Badge key={i} variant="outline" className="font-mono text-[10px] px-1.5 py-0 border-purple-500/30 text-purple-300">
                    {route.method} {route.path}
                  </Badge>
                ))}
                {routes.length > 3 && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                    +{routes.length - 3} more
                  </Badge>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default FlagCard;