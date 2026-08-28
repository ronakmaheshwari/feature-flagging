"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress, ProgressTrack, ProgressIndicator } from "@/components/ui/progress";
import { Check, X, Users, UserMinus, UserPlus, Settings, Trash2, Eye, Edit } from "lucide-react";
import type { FeatureFlag, FeatureFlagDetail } from "@/lib/api-services";

interface FlagCardProps {
  flag: FeatureFlag | FeatureFlagDetail;
  variant?: "compact" | "detailed";
  showActions?: boolean;
  onToggle?: (flagId: string, enabled: boolean) => void;
  onEdit?: (flag: FeatureFlag | FeatureFlagDetail) => void;
  onDelete?: (flagId: string) => void;
  onViewDetails?: (flag: FeatureFlag | FeatureFlagDetail) => void;
  onManageRules?: (flag: FeatureFlag | FeatureFlagDetail) => void;
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
  const isDetail = "whitelist" in flag;
  const whitelistCount = isDetail ? flag.whitelist.length : 0;
  const blacklistCount = isDetail ? flag.blacklist.length : 0;
  const groupsCount = isDetail ? flag.groups.length : (flag.rules?.groups?.length || 0);
  const rollout = flag.rules?.rollout ?? flag.rollout ?? 0;

  const getStatusBadge = () => {
    if (!flag.is_enabled) {
      return <Badge variant="destructive">Disabled</Badge>;
    }
    if (rollout > 0 && rollout < 100) {
      return <Badge variant="secondary">Rollout {rollout}%</Badge>;
    }
    if (whitelistCount > 0 || blacklistCount > 0 || groupsCount > 0) {
      return <Badge variant="default">Targeted</Badge>;
    }
    return <Badge variant="default">Enabled</Badge>;
  };

  const getEnvironmentBadge = () => {
    return flag.environment === "PRODUCTION" ? (
      <Badge variant="destructive">{flag.environment}</Badge>
    ) : (
      <Badge variant="secondary">{flag.environment}</Badge>
    );
  };

  if (variant === "compact") {
    return (
      <Card className="flex flex-row items-center gap-3 p-3 hover:bg-muted/50 transition-colors">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <CardTitle className="font-mono text-sm truncate">{flag.name}</CardTitle>
            {getStatusBadge()}
            {getEnvironmentBadge()}
          </div>
          <CardDescription className="text-xs truncate">
            Rollout: {rollout}% | Whitelist: {whitelistCount} | Blacklist: {blacklistCount} | Groups: {groupsCount}
          </CardDescription>
        </div>
        {showActions && (
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onViewDetails?.(flag)}
              disabled={loading}
              className="h-7 w-7"
              aria-label="View details"
            >
              <Eye className="size-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onEdit?.(flag)}
              disabled={loading}
              className="h-7 w-7"
              aria-label="Edit flag"
            >
              <Edit className="size-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onManageRules?.(flag)}
              disabled={loading}
              className="h-7 w-7"
              aria-label="Manage rules"
            >
              <Settings className="size-3.5" />
            </Button>
            <input
              type="checkbox"
              role="switch"
              checked={flag.is_enabled}
              onChange={(e) => onToggle?.(flag.id, e.target.checked)}
              disabled={loading}
              aria-label={flag.is_enabled ? "Disable flag" : "Enable flag"}
              className="size-4 rounded-none border-input"
            />
          </div>
        )}
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <CardTitle className="font-mono text-base truncate">{flag.name}</CardTitle>
              {getStatusBadge()}
              {getEnvironmentBadge()}
            </div>
            <CardDescription className="text-xs">
              ID: {flag.id} • Created: {new Date(flag.createdAt).toLocaleDateString()} • Updated: {new Date(flag.updatedAt).toLocaleDateString()}
            </CardDescription>
          </div>
          {showActions && (
            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onViewDetails?.(flag)}
                disabled={loading}
                className="h-7 w-7"
                aria-label="View details"
              >
                <Eye className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit?.(flag)}
                disabled={loading}
                className="h-7 w-7"
                aria-label="Edit flag"
              >
                <Edit className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onManageRules?.(flag)}
                disabled={loading}
                className="h-7 w-7"
                aria-label="Manage rules"
              >
                <Settings className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete?.(flag.id)}
                disabled={loading}
                className="h-7 w-7 text-destructive hover:text-destructive"
                aria-label="Delete flag"
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-3">
          <div>
            <div className="text-xs text-muted-foreground">Rollout</div>
            <div className="flex items-center gap-2">
              <Progress value={rollout} className="flex-1" max={100}>
                <ProgressTrack>
                  <ProgressIndicator />
                </ProgressTrack>
              </Progress>
              <span className="w-16 text-right text-xs text-muted-foreground tabular-nums">{rollout}%</span>
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Whitelist</div>
            <div className="flex items-center gap-1">
              <UserPlus className="size-3.5 text-green-600" />
              <span className="font-medium">{whitelistCount}</span>
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Blacklist</div>
            <div className="flex items-center gap-1">
              <UserMinus className="size-3.5 text-red-600" />
              <span className="font-medium">{blacklistCount}</span>
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Groups</div>
            <div className="flex items-center gap-1">
              <Users className="size-3.5 text-blue-600" />
              <span className="font-medium">{groupsCount}</span>
            </div>
          </div>
        </div>

        {(whitelistCount > 0 || blacklistCount > 0 || groupsCount > 0) && (
          <div className="space-y-2 pt-2 border-t border-border">
            {whitelistCount > 0 && isDetail && (
              <div>
                <div className="flex items-center gap-1 text-xs text-green-600 mb-1">
                  <Check className="size-3" />
                  <span>Whitelisted Users</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {flag.whitelist.slice(0, 5).map((user) => (
                    <Badge key={user.userId} variant="outline" className="text-xs">
                      {user.username || user.userId}
                    </Badge>
                  ))}
                  {flag.whitelist.length > 5 && (
                    <Badge variant="secondary" className="text-xs">
                      +{flag.whitelist.length - 5} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
            {blacklistCount > 0 && isDetail && (
              <div>
                <div className="flex items-center gap-1 text-xs text-red-600 mb-1">
                  <X className="size-3" />
                  <span>Blacklisted Users</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {flag.blacklist.slice(0, 5).map((user) => (
                    <Badge key={user.userId} variant="destructive" className="text-xs">
                      {user.username || user.userId}
                    </Badge>
                  ))}
                  {flag.blacklist.length > 5 && (
                    <Badge variant="secondary" className="text-xs">
                      +{flag.blacklist.length - 5} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
            {groupsCount > 0 && isDetail && (
              <div>
                <div className="flex items-center gap-1 text-xs text-blue-600 mb-1">
                  <Users className="size-3" />
                  <span>Groups</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {flag.groups.slice(0, 5).map((group) => (
                    <Badge key={group.id} variant="default" className="text-xs">
                      {group.name}
                    </Badge>
                  ))}
                  {flag.groups.length > 5 && (
                    <Badge variant="secondary" className="text-xs">
                      +{flag.groups.length - 5} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}