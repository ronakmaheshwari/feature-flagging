"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { FlagCard } from "@/components/ui/flag-card";
import { featureFlagService, groupService, contentService, routeFlagService } from "@/lib/api-services";
import { useAuth } from "@/components/custom/authContext";
import { Flag, Users, GitBranch, FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DashboardOverview() {
  const { role, token } = useAuth();
  const isAdmin = role === "ADMIN";

  const { data: flagsData } = useQuery({
    queryKey: ["flags", "all"],
    queryFn: () => featureFlagService.getAll(),
    enabled: isAdmin,
  });

  const { data: flagsNamesData } = useQuery({
    queryKey: ["flags", "names"],
    queryFn: () => featureFlagService.getNames(true),
    enabled: !isAdmin,
  });

  const { data: groupsData } = useQuery({
    queryKey: ["groups"],
    queryFn: () => groupService.getAll(),
    enabled: isAdmin,
  });

  const { data: contentData } = useQuery({
    queryKey: ["content", "count"],
    queryFn: () => contentService.count(),
    enabled: !!token,
  });

  const { data: routeFlagsData } = useQuery({
    queryKey: ["route-flags"],
    queryFn: () => routeFlagService.getAll(),
    enabled: isAdmin,
  });

  const flags = isAdmin ? flagsData?.data || [] : flagsNamesData?.data || [];
  const groups = groupsData?.data || [];
  const content = contentData?.data ?? { total: 0, draft: 0, published: 0, deleted: 0, platformCount: {} as Record<string, number> };
  const routeFlags = routeFlagsData?.data || [];

  const enabledFlags = flags.filter((f: any) => f.is_enabled).length;
  const draftContent = content.draft ?? 0;
  const postedContent = content.published ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's an overview of your feature flags.</p>
        </div>
        {isAdmin && (
          <Button asChild>
            <a href="/dashboard/flags/new">
              <Plus className="size-4 mr-2" />
              Create Flag
            </a>
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Flags"
          value={flags.length}
          description={isAdmin ? "Feature flags in system" : "Flags available to you"}
          icon={<Flag className="size-5" />}
          trend={{ value: 12, label: "vs last month" }}
          variant="primary"
        />
        <StatCard
          title="Active Flags"
          value={enabledFlags}
          description="Currently enabled flags"
          icon={<Flag className="size-5 text-green-600" />}
          trend={{ value: 5, label: "vs last month" }}
          variant="success"
        />
        <StatCard
          title={isAdmin ? "Total Groups" : "My Content"}
          value={isAdmin ? groups.length : content.total ?? 0}
          description={isAdmin ? "User groups configured" : "Content pieces created"}
          icon={isAdmin ? <Users className="size-5" /> : <FileText className="size-5" />}
          trend={{ value: isAdmin ? 8 : 15, label: "vs last month" }}
          variant={isAdmin ? "default" : "warning"}
        />
        {isAdmin && (
          <StatCard
            title="Route Flags"
            value={routeFlags.length}
            description="Routes with feature flags"
            icon={<GitBranch className="size-5" />}
            trend={{ value: 3, label: "vs last month" }}
            variant="destructive"
          />
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Feature Flags</CardTitle>
            {isAdmin && (
              <Button variant="ghost" size="sm" asChild>
                <a href="/dashboard/flags">View all</a>
              </Button>
            )}
          </CardHeader>
          <CardContent className="pt-0">
            {flags.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Flag className="size-12 mx-auto mb-2 opacity-50" />
                <p>No feature flags found</p>
                {isAdmin && (
                  <Button asChild className="mt-4">
                    <a href="/dashboard/flags/new">Create your first flag</a>
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {flags.slice(0, 5).map((flag: any) => (
                  <FlagCard key={flag.id} flag={flag} variant="compact" />
                ))}
                {flags.length > 5 && (
                  <Button variant="ghost" size="sm" className="w-full" asChild>
                    <a href="/dashboard/flags">View all {flags.length} flags</a>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-none border border-border">
                <p className="text-xs text-muted-foreground">Draft Content</p>
                <p className="text-2xl font-bold">{draftContent}</p>
              </div>
              <div className="p-3 rounded-none border border-border">
                <p className="text-xs text-muted-foreground">Posted Content</p>
                <p className="text-2xl font-bold text-green-600">{postedContent}</p>
              </div>
            </div>
            <div className="pt-2 border-t border-border">
              <h4 className="text-sm font-medium mb-2">Recent Activity</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Total Flags</span>
                  <span className="font-medium">{flags.length}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Enabled</span>
                  <span className="font-medium text-green-600">{enabledFlags}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Disabled</span>
                  <span className="font-medium text-red-600">{flags.length - enabledFlags}</span>
                </div>
                {isAdmin && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Groups</span>
                    <span className="font-medium">{groups.length}</span>
                  </div>
                )}
                {isAdmin && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Route Flags</span>
                    <span className="font-medium">{routeFlags.length}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}