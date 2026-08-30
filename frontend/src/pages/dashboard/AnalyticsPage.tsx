"use client";

import { useQuery } from "@tanstack/react-query";
import { featureFlagService, groupService, contentService, routeFlagService } from "@/lib/api-services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Progress, ProgressTrack, ProgressIndicator } from "@/components/ui/progress";
import { Flag, Users, GitBranch } from "lucide-react";
import { useAuth } from "@/components/custom/authContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export function AnalyticsPage() {
  const { token } = useAuth();

  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      toast.error("Please login to access dashboard");
      navigate("/signin");
    }
  }, [token]);
  
  const { data: flagsData } = useQuery({
    queryKey: ["flags", "all"],
    queryFn: () => featureFlagService.getAll(),
    staleTime: 60000,
    enabled: !!token,
  });

  const { data: groupsData } = useQuery({
    queryKey: ["groups"],
    queryFn: () => groupService.getAll(),
    staleTime: 60000,
  });

  const { data: contentData } = useQuery({
    queryKey: ["count", token],
    queryFn: () => contentService.count(),
    staleTime: 60000,
    enabled: !!token,
  });

  const { data: routesData } = useQuery({
    queryKey: ["route-flags"],
    queryFn: () => routeFlagService.getAll(),
    staleTime: 60000,
  });

  const flags = flagsData?.data || [];
  const groups = groupsData?.data || [];
  const content = contentData?.data || [];
  const routes = routesData?.data || [];

  const enabledFlags = flags.filter((f: any) => f.is_enabled === true).length;
  const disabledFlags = flags.length - enabledFlags;
  const devFlags = flags.filter((f: any) => f.environment === "DEVELOPMENT").length;
  const prodFlags = flags.filter((f: any) => f.environment === "PRODUCTION").length;
  const draftContent = content.draft;
  const postedContent = content.published;
  const deletedContent = content.deleted;

  const platformCounts = content.platformCount || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">Overview of feature flag usage and system metrics.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Flags"
          value={flags.length}
          description="Feature flags in system"
          icon={<Flag className="size-5" />}
          trend={{ value: 12, label: "vs last month" }}
          variant="primary"
        />
        <StatCard
          title="Active Flags"
          value={enabledFlags}
          description="Currently enabled"
          icon={<Flag className="size-5 text-green-600" />}
          trend={{ value: 5, label: "vs last month" }}
          variant="success"
        />
        <StatCard
          title="User Groups"
          value={groups.length}
          description="Configured groups"
          icon={<Users className="size-5" />}
          trend={{ value: 8, label: "vs last month" }}
          variant="default"
        />
        <StatCard
          title="Route Flags"
          value={routes.length}
          description="Routes with flags"
          icon={<GitBranch className="size-5" />}
          trend={{ value: 3, label: "vs last month" }}
          variant="destructive"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Flag Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Enabled</span>
                <span className="font-medium text-green-600">{enabledFlags} ({flags.length ? Math.round((enabledFlags / flags.length) * 100) : 0}%)</span>
              </div>
              <Progress value={flags.length ? (enabledFlags / flags.length) * 100 : 0} max={100} className="h-2">
                <ProgressTrack><ProgressIndicator className="bg-green-600" /></ProgressTrack>
              </Progress>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Disabled</span>
                <span className="font-medium text-red-600">{disabledFlags} ({flags.length ? Math.round((disabledFlags / flags.length) * 100) : 0}%)</span>
              </div>
              <Progress value={flags.length ? (disabledFlags / flags.length) * 100 : 0} max={100} className="h-2">
                <ProgressTrack><ProgressIndicator className="bg-red-600" /></ProgressTrack>
              </Progress>
            </div>
            <div className="pt-4 border-t border-border">
              <h4 className="font-medium mb-3">Environment Distribution</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Development</span>
                  <span className="font-medium">{devFlags}</span>
                </div>
                <Progress value={flags.length ? (devFlags / flags.length) * 100 : 0} max={100} className="h-1.5">
                  <ProgressTrack><ProgressIndicator className="bg-blue-600" /></ProgressTrack>
                </Progress>
                <div className="flex justify-between text-sm">
                  <span>Production</span>
                  <span className="font-medium">{prodFlags}</span>
                </div>
                <Progress value={flags.length ? (prodFlags / flags.length) * 100 : 0} max={100} className="h-1.5">
                  <ProgressTrack><ProgressIndicator className="bg-purple-600" /></ProgressTrack>
                </Progress>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Content Analytics</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-none">
                <p className="text-2xl font-bold text-green-600">{postedContent}</p>
                <p className="text-xs text-muted-foreground">Posted</p>
              </div>
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-none">
                <p className="text-2xl font-bold text-blue-600">{draftContent}</p>My Content

                <p className="text-xs text-muted-foreground">Drafts</p>
              </div>
              <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-none">
                <p className="text-2xl font-bold text-red-600">{deletedContent}</p>
                <p className="text-xs text-muted-foreground">Deleted</p>
              </div>
            </div>
            <div className="pt-4 border-t border-border">
              <h4 className="font-medium mb-3">Content by Platform</h4>
              <div className="space-y-2">
                {Object.entries(platformCounts).map(([platform, count]) => (
                  <div key={platform} className="flex items-center gap-3">
                    <span className="text-xs font-medium w-24">{platform}</span>
                    <Progress
                      value={content.total ? (Number(count) / content.total) * 100 : 0}
                      max={100}
                      className="flex-1 h-1.5"
                    />
                    <span className="text-xs text-muted-foreground w-12 text-right">{Number(count)}</span>
                  </div>
                ))}
                {Object.keys(platformCounts).length === 0 && (
                  <p className="text-center text-muted-foreground text-sm">No content data available</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Top Groups by Users</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {groups.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No groups configured</p>
            ) : (
              <div className="space-y-3">
                {groups
                  .sort((a: any, b: any) => b.totalUsers - a.totalUsers)
                  .slice(0, 5)
                  .map((group: any) => (
                    <div key={group.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="size-4 text-primary" />
                        </div>
                        <span className="font-medium">{group.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{group.totalUsers} users</span>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Route Flag Methods</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {routes.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No route flags configured</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(
                  routes.reduce((acc: Record<string, number>, r: any) => {
                    acc[r.method] = (acc[r.method] || 0) + 1;
                    return acc;
                  }, {})
                ).map(([method, count]) => (
                  <div key={method} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-none text-xs font-medium bg-primary/10 text-primary">
                      {method}
                    </span>
                    <span className="text-sm text-muted-foreground">{count} routes</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Flag Targeting Usage</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <span>Flags with Rollout</span>
                <span className="font-medium">{flags.filter((f: any) => (f.rules?.rollout || f.rollout) > 0).length}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <span>Flags with Whitelist</span>
                <span className="font-medium">{flags.filter((f: any) => f.rules?.whitelist?.length > 0).length}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <span>Flags with Blacklist</span>
                <span className="font-medium">{flags.filter((f: any) => f.rules?.blacklist?.length > 0).length}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <span>Flags with Groups</span>
                <span className="font-medium">{flags.filter((f: any) => f.rules?.groups?.length > 0).length}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>Simple On/Off Flags</span>
                <span className="font-medium">
                  {flags.filter((f: any) => {
                    const rollout = f.rules?.rollout ?? f.rollout ?? 0;
                    return !f.rules?.whitelist?.length && !f.rules?.blacklist?.length &&
                      !f.rules?.groups?.length && rollout === 0;
                  }).length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}