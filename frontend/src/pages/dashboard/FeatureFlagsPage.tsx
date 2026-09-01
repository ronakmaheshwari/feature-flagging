"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FlagCard } from "@/components/ui/flag-card";
import { featureFlagService } from "@/lib/api-services";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal, ConfirmModal } from "@/components/ui/modal";
import { Plus, Search, RefreshCw, Edit, Settings, Trash2, Check, X, Users, UserPlus, UserMinus, Route, ShieldCheck, Play, Sparkles } from "lucide-react";
import { useAuth } from "@/components/custom/authContext";
import { toast } from "sonner";
import { FlagRulesForm } from "@/components/custom/featureFlagModal";

export function FeatureFlagsPage() {
  const { role, user } = useAuth();
  const isAdmin = role === "ADMIN";
  const queryClient = useQueryClient();

  const [search, setSearch] = React.useState("");
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [showRulesModal, setShowRulesModal] = React.useState(false);
  const [showDetailModal, setShowDetailModal] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [showEvalModal, setShowEvalModal] = React.useState(false);

  const [selectedFlag, setSelectedFlag] = React.useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = React.useState<string | null>(null);

  // Always fetch all flags with full rules & routes from backend
  const { data: flagsData, refetch, isFetching } = useQuery({
    queryKey: ["flags", "all"],
    queryFn: () => featureFlagService.getAll(),
    staleTime: 10000,
  });

  const flags: any[] = Array.isArray(flagsData?.data) ? flagsData.data : [];

  const filteredFlags = flags.filter((flag: any) =>
    (flag.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (flag.id || "").toLowerCase().includes(search.toLowerCase()) ||
    (flag.environment || "").toLowerCase().includes(search.toLowerCase())
  );

  const toggleMutation = useMutation({
    mutationFn: ({ flagId, isEnabled }: { flagId: string; isEnabled: boolean }) =>
      featureFlagService.toggle(flagId, isEnabled),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["flags"] });
      toast.success(`Flag ${variables.isEnabled ? "enabled" : "disabled"} successfully`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update flag toggle state");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (flagId: string) => featureFlagService.delete(flagId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flags"] });
      setDeleteConfirm(null);
      if (showDetailModal) setShowDetailModal(false);
      toast.success("Flag deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete flag");
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => featureFlagService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flags"] });
      setShowCreateModal(false);
      toast.success("Feature flag created successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create flag");
    },
  });

  const editMutation = useMutation({
    mutationFn: async ({
      flagId,
      rollout,
      isEnabled,
      currentEnabled,
    }: {
      flagId: string;
      rollout: number;
      isEnabled: boolean;
      currentEnabled: boolean;
    }) => {
      // 1. Update rules rollout
      await featureFlagService.updateRules(flagId, {
        rollout,
      });

      // 2. If enabled state changed, toggle it
      if (isEnabled !== currentEnabled) {
        await featureFlagService.toggle(flagId, isEnabled);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flags"] });
      setShowEditModal(false);
      toast.success("Flag updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update flag");
    },
  });

  const handleToggle = (flagId: string, enabled: boolean) => {
    toggleMutation.mutate({ flagId, isEnabled: enabled });
  };

  const handleDelete = (flagId: string) => {
    setDeleteConfirm(flagId);
  };

  const handleViewDetails = (flag: any) => {
    setSelectedFlag(flag);
    setShowDetailModal(true);
  };

  const handleEdit = (flag: any) => {
    setSelectedFlag(flag);
    setShowEditModal(true);
  };

  const handleManageRules = (flag: any) => {
    setSelectedFlag(flag);
    setShowRulesModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <span>Feature Flags</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              {flags.length} Total
            </span>
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isAdmin
              ? "Create, manage rules, rollout percentages, and targeted access for all feature flags."
              : "View and evaluate real-time feature flags available to your account."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <Button
              onClick={() => setShowCreateModal(true)}
              className="gap-1.5 cursor-pointer shadow-sm"
            >
              <Plus className="size-4" />
              <span>Create Flag</span>
            </Button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by flag name, ID, or environment..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-background/80"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => refetch()}
          disabled={isFetching}
          className="gap-2 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`size-4 ${isFetching ? "animate-spin" : ""}`} />
          <span>{isFetching ? "Refreshing..." : "Refresh"}</span>
        </Button>
      </div>

      {/* Flags Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredFlags.length === 0 ? (
          <div className="col-span-full text-center py-16 px-4 rounded-xl border border-dashed border-border/80 bg-muted/10">
            <div className="mx-auto size-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <ShieldCheck className="size-6 text-muted-foreground" />
            </div>
            <h3 className="text-base font-semibold text-foreground">
              {search ? "No matching flags found" : "No feature flags available"}
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1 mb-4">
              {search
                ? `No flags matched your search query "${search}". Try adjusting your keywords.`
                : "Create your first feature flag to start progressive rollouts and targeted feature gating."}
            </p>
            {isAdmin && !search && (
              <Button onClick={() => setShowCreateModal(true)} className="gap-1.5 cursor-pointer">
                <Plus className="size-4" />
                <span>Create Feature Flag</span>
              </Button>
            )}
          </div>
        ) : (
          filteredFlags.map((flag: any) => (
            <FlagCard
              key={flag.id}
              flag={flag}
              variant="detailed"
              showActions={isAdmin}
              onToggle={handleToggle}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onViewDetails={handleViewDetails}
              onManageRules={handleManageRules}
              loading={toggleMutation.isPending || deleteMutation.isPending}
            />
          ))
        )}
      </div>

      {/* CREATE FLAG MODAL */}
      <Modal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        title="Create New Feature Flag"
        size="lg"
      >
        <CreateFlagForm
          onSubmit={(data) => createMutation.mutate(data)}
          onCancel={() => setShowCreateModal(false)}
          loading={createMutation.isPending}
        />
      </Modal>

      {/* VIEW FLAG DETAILS MODAL */}
      <Modal
        open={showDetailModal}
        onOpenChange={setShowDetailModal}
        title="Feature Flag Details"
        size="lg"
      >
        {selectedFlag && (
          <FlagDetailView
            flag={selectedFlag}
            onClose={() => setShowDetailModal(false)}
            onManageRules={() => {
              setShowDetailModal(false);
              setShowRulesModal(true);
            }}
            onEdit={() => {
              setShowDetailModal(false);
              setShowEditModal(true);
            }}
            onEvaluate={() => {
              setShowDetailModal(false);
              setShowEvalModal(true);
            }}
            onDelete={() => {
              setShowDetailModal(false);
              setDeleteConfirm(selectedFlag.id);
            }}
            isAdmin={isAdmin}
          />
        )}
      </Modal>

      {/* EDIT FLAG MODAL */}
      <Modal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        title="Edit Feature Flag"
        size="md"
      >
        {selectedFlag && (
          <EditFlagForm
            flag={selectedFlag}
            onSubmit={(data) =>
              editMutation.mutate({
                flagId: selectedFlag.id,
                rollout: data.rollout,
                isEnabled: data.is_enabled,
                currentEnabled: Boolean(selectedFlag.is_enabled),
              })
            }
            onCancel={() => setShowEditModal(false)}
            loading={editMutation.isPending}
          />
        )}
      </Modal>

      {/* MANAGE RULES MODAL */}
      <Modal
        open={showRulesModal}
        onOpenChange={setShowRulesModal}
        title="Manage Targeting Rules"
        size="xl"
      >
        {selectedFlag && (
          <FlagRulesForm
            flag={selectedFlag}
            onClose={() => {
              setShowRulesModal(false);
              queryClient.invalidateQueries({ queryKey: ["flags"] });
            }}
          />
        )}
      </Modal>

      {/* EVALUATION TESTER MODAL */}
      <Modal
        open={showEvalModal}
        onOpenChange={setShowEvalModal}
        title="Evaluate Feature Flag"
        size="md"
      >
        {selectedFlag && (
          <FlagEvaluationTester
            flag={selectedFlag}
            currentUserId={user?.id || ""}
            onClose={() => setShowEvalModal(false)}
          />
        )}
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <ConfirmModal
        open={!!deleteConfirm}
        onOpenChange={(open) => {
          if (!open) setDeleteConfirm(null);
        }}
        title="Delete Feature Flag"
        message="Are you sure you want to delete this feature flag? All users currently relying on this flag will lose access immediately."
        variant="destructive"
        onConfirm={() => {
          if (deleteConfirm) deleteMutation.mutate(deleteConfirm);
        }}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Create Flag Form Component                                                 */
/* -------------------------------------------------------------------------- */
function CreateFlagForm({
  onSubmit,
  onCancel,
  loading,
}: {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [formData, setFormData] = React.useState({
    name: "",
    is_enabled: false,
    environment: "DEVELOPMENT" as "DEVELOPMENT" | "PRODUCTION",
    rollout: 100,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Please provide a valid flag name");
      return;
    }
    onSubmit({
      name: formData.name.trim(),
      is_enabled: formData.is_enabled,
      environment: formData.environment,
      rollout: Number(formData.rollout),
      rules: {
        whitelist: [],
        blacklist: [],
        groups: [],
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1.5 text-foreground">
          Flag Name <span className="text-destructive">*</span>
        </label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g. new-checkout-flow or ai_content_v2"
          required
          className="font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Must be unique and between 3 to 30 characters.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1.5 text-foreground">
            Environment
          </label>
          <select
            value={formData.environment}
            onChange={(e) =>
              setFormData({
                ...formData,
                environment: e.target.value as "DEVELOPMENT" | "PRODUCTION",
              })
            }
            className="w-full h-9 px-3 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="DEVELOPMENT">DEVELOPMENT</option>
            <option value="PRODUCTION">PRODUCTION</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5 text-foreground">
            Initial Rollout ({formData.rollout}%)
          </label>
          <Input
            type="number"
            min={0}
            max={100}
            value={formData.rollout}
            onChange={(e) => {
              const val = Math.min(100, Math.max(0, Number(e.target.value) || 0));
              setFormData({ ...formData, rollout: val });
            }}
            className="font-mono text-sm"
          />
        </div>
      </div>

      <div className="p-3 rounded-lg border border-border bg-muted/20">
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.is_enabled}
            onChange={(e) =>
              setFormData({ ...formData, is_enabled: e.target.checked })
            }
            className="size-4 rounded border-input cursor-pointer"
          />
          <div>
            <span className="text-sm font-medium text-foreground">
              Enable immediately on creation
            </span>
            <p className="text-xs text-muted-foreground">
              Users matching rollout percentage or rules will receive this flag.
            </p>
          </div>
        </label>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t border-border">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
          className="cursor-pointer"
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading} className="cursor-pointer">
          {loading ? "Creating..." : "Create Feature Flag"}
        </Button>
      </div>
    </form>
  );
}

/* -------------------------------------------------------------------------- */
/* Edit Flag Form Component                                                   */
/* -------------------------------------------------------------------------- */
function EditFlagForm({
  flag,
  onSubmit,
  onCancel,
  loading,
}: {
  flag: any;
  onSubmit: (data: { rollout: number; is_enabled: boolean }) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const initialRollout =
    typeof flag.rollout === "number"
      ? flag.rollout
      : typeof flag.rules?.rollout === "number"
      ? flag.rules.rollout
      : 0;

  const [rollout, setRollout] = React.useState<number>(initialRollout);
  const [isEnabled, setIsEnabled] = React.useState<boolean>(
    Boolean(flag.is_enabled)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ rollout, is_enabled: isEnabled });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
          Flag Name
        </label>
        <div className="p-2.5 rounded-md border border-border bg-muted/40 font-mono text-sm text-foreground">
          {flag.name}
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label className="block text-sm font-medium text-foreground">
            Rollout Percentage
          </label>
          <span className="text-xs font-mono font-bold text-primary">
            {rollout}%
          </span>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={0}
            max={100}
            value={rollout}
            onChange={(e) => setRollout(Number(e.target.value))}
            className="flex-1 accent-primary cursor-pointer"
          />
          <Input
            type="number"
            min={0}
            max={100}
            value={rollout}
            onChange={(e) =>
              setRollout(Math.min(100, Math.max(0, Number(e.target.value) || 0)))
            }
            className="w-20 font-mono text-sm"
          />
        </div>
      </div>

      <div className="p-3 rounded-lg border border-border bg-muted/20">
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={(e) => setIsEnabled(e.target.checked)}
            className="size-4 rounded border-input cursor-pointer"
          />
          <div>
            <span className="text-sm font-medium text-foreground">
              Flag is Active (Enabled)
            </span>
            <p className="text-xs text-muted-foreground">
              Toggle flag on or off globally.
            </p>
          </div>
        </label>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t border-border">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
          className="cursor-pointer"
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading} className="cursor-pointer">
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}

/* -------------------------------------------------------------------------- */
/* Flag Detail View Modal Component                                           */
/* -------------------------------------------------------------------------- */
function FlagDetailView({
  flag,
  onClose,
  onManageRules,
  onEdit,
  onEvaluate,
  onDelete,
  isAdmin,
}: {
  flag: any;
  onClose: () => void;
  onManageRules: () => void;
  onEdit: () => void;
  onEvaluate: () => void;
  onDelete: () => void;
  isAdmin: boolean;
}) {
  const rules = flag.rules ?? {};
  const rollout =
    typeof flag.rollout === "number"
      ? flag.rollout
      : typeof rules.rollout === "number"
      ? rules.rollout
      : 0;

  const whitelist: any[] = Array.isArray(flag.whitelist)
    ? flag.whitelist
    : Array.isArray(rules.whitelist)
    ? rules.whitelist
    : [];

  const blacklist: any[] = Array.isArray(flag.blacklist)
    ? flag.blacklist
    : Array.isArray(rules.blacklist)
    ? rules.blacklist
    : [];

  const groups: any[] = Array.isArray(flag.groups)
    ? flag.groups
    : Array.isArray(rules.groups)
    ? rules.groups
    : [];

  const routes: any[] = Array.isArray(flag.routes) ? flag.routes : [];

  return (
    <div className="space-y-5">
      {/* Header Info Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-border/80 bg-muted/20">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-bold font-mono text-foreground">
              {flag.name}
            </h2>
            <Badge
              variant={flag.environment === "PRODUCTION" ? "destructive" : "secondary"}
              className="font-mono text-[11px]"
            >
              {flag.environment}
            </Badge>
            <Badge
              className={`font-mono text-[11px] ${
                flag.is_enabled
                  ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                  : "bg-destructive/15 text-destructive border-destructive/30"
              }`}
            >
              {flag.is_enabled ? "Enabled" : "Disabled"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1 font-mono">
            UUID: {flag.id}
          </p>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={onEdit}
              className="gap-1 text-xs cursor-pointer"
            >
              <Edit className="size-3.5" />
              <span>Edit</span>
            </Button>
            <Button
              size="sm"
              onClick={onManageRules}
              className="gap-1 text-xs cursor-pointer"
            >
              <Settings className="size-3.5" />
              <span>Rules</span>
            </Button>
          </div>
        )}
      </div>

      {/* Rollout & Targeting Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-lg border border-border bg-card">
          <div className="text-[11px] font-medium text-muted-foreground uppercase mb-1">
            Rollout
          </div>
          <div className="text-lg font-bold text-foreground tabular-nums">
            {rollout}%
          </div>
          <div className="h-1.5 w-full bg-muted rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${rollout}%` }}
            />
          </div>
        </div>

        <div className="p-3 rounded-lg border border-border bg-card">
          <div className="text-[11px] font-medium text-muted-foreground uppercase mb-1">
            Whitelist
          </div>
          <div className="text-lg font-bold text-emerald-400 tabular-nums">
            {whitelist.length}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">Always Enabled</p>
        </div>

        <div className="p-3 rounded-lg border border-border bg-card">
          <div className="text-[11px] font-medium text-muted-foreground uppercase mb-1">
            Blacklist
          </div>
          <div className="text-lg font-bold text-rose-400 tabular-nums">
            {blacklist.length}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">Always Blocked</p>
        </div>

        <div className="p-3 rounded-lg border border-border bg-card">
          <div className="text-[11px] font-medium text-muted-foreground uppercase mb-1">
            Target Groups
          </div>
          <div className="text-lg font-bold text-blue-400 tabular-nums">
            {groups.length}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">Group Access</p>
        </div>
      </div>

      {/* Whitelist, Blacklist, and Groups Details */}
      <div className="space-y-4 max-h-60 overflow-y-auto pr-1 text-sm">
        {whitelist.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 font-medium text-emerald-400 mb-2 text-xs">
              <UserPlus className="size-3.5" />
              <span>Whitelisted Users ({whitelist.length})</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {whitelist.map((item: any, i: number) => {
                const label =
                  typeof item === "string"
                    ? item
                    : item.username || item.userId || `User ${i + 1}`;
                return (
                  <Badge
                    key={i}
                    variant="outline"
                    className="border-emerald-500/30 text-emerald-400 text-xs py-1"
                  >
                    {label}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {blacklist.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 font-medium text-rose-400 mb-2 text-xs">
              <UserMinus className="size-3.5" />
              <span>Blacklisted Users ({blacklist.length})</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {blacklist.map((item: any, i: number) => {
                const label =
                  typeof item === "string"
                    ? item
                    : item.username || item.userId || `User ${i + 1}`;
                return (
                  <Badge key={i} variant="destructive" className="text-xs py-1">
                    {label}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {groups.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 font-medium text-blue-400 mb-2 text-xs">
              <Users className="size-3.5" />
              <span>Allowed Groups ({groups.length})</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {groups.map((group: any, i: number) => {
                const label =
                  typeof group === "string"
                    ? group
                    : group.name || group.id || `Group ${i + 1}`;
                return (
                  <Badge
                    key={i}
                    className="bg-blue-500/15 text-blue-400 border border-blue-500/30 text-xs py-1"
                  >
                    {label}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {routes.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 font-medium text-purple-400 mb-2 text-xs">
              <Route className="size-3.5" />
              <span>Linked Backend Routes ({routes.length})</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {routes.map((route: any, i: number) => (
                <Badge
                  key={i}
                  variant="outline"
                  className="font-mono text-xs py-1 border-purple-500/30 text-purple-300"
                >
                  {route.method} {route.path}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Controls */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <Button
          type="button"
          variant="outline"
          onClick={onEvaluate}
          className="gap-1.5 text-xs cursor-pointer"
        >
          <Play className="size-3.5 text-primary" />
          <span>Test Evaluation</span>
        </Button>

        <div className="flex gap-2">
          {isAdmin && (
            <Button
              type="button"
              variant="destructive"
              onClick={onDelete}
              className="gap-1.5 text-xs cursor-pointer"
            >
              <Trash2 className="size-3.5" />
              <span>Delete Flag</span>
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="text-xs cursor-pointer"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Flag Evaluation Tester Modal Component                                     */
/* -------------------------------------------------------------------------- */
function FlagEvaluationTester({
  flag,
  currentUserId,
  onClose,
}: {
  flag: any;
  currentUserId: string;
  onClose: () => void;
}) {
  const [testUserId, setTestUserId] = React.useState(currentUserId);
  const [evalResult, setEvalResult] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testUserId.trim()) {
      toast.error("Please enter a valid User ID");
      return;
    }

    try {
      setLoading(true);
      const res = await featureFlagService.evaluate(flag.id, testUserId.trim());
      setEvalResult(res);
      if (res.enabled) {
        toast.success(`Flag evaluated as ENABLED for user ${testUserId}`);
      } else {
        toast.info(`Flag evaluated as DISABLED for user ${testUserId}`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to evaluate feature flag");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground mb-3">
          Test whether <span className="font-mono font-medium text-foreground">{flag.name}</span> will resolve to <strong className="text-emerald-400">ENABLED</strong> or <strong className="text-rose-400">DISABLED</strong> for any specific user ID.
        </p>

        <form onSubmit={handleEvaluate} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
              Test User ID
            </label>
            <div className="flex gap-2">
              <Input
                value={testUserId}
                onChange={(e) => setTestUserId(e.target.value)}
                placeholder="Enter User UUID..."
                className="font-mono text-sm"
                required
              />
              <Button type="submit" disabled={loading} className="gap-1.5 shrink-0 cursor-pointer">
                <Sparkles className="size-3.5" />
                <span>{loading ? "Testing..." : "Evaluate"}</span>
              </Button>
            </div>
          </div>
        </form>
      </div>

      {evalResult && (
        <div className={`p-4 rounded-xl border ${
          evalResult.enabled
            ? "border-emerald-500/30 bg-emerald-500/10"
            : "border-rose-500/30 bg-rose-500/10"
        }`}>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center justify-center size-6 rounded-full ${
              evalResult.enabled ? "bg-emerald-500 text-black" : "bg-rose-500 text-white"
            }`}>
              {evalResult.enabled ? <Check className="size-4" /> : <X className="size-4" />}
            </span>
            <span className={`font-bold text-base ${
              evalResult.enabled ? "text-emerald-400" : "text-rose-400"
            }`}>
              Result: {evalResult.enabled ? "ENABLED" : "DISABLED"}
            </span>
          </div>

          {evalResult.reason && (
            <p className="text-xs text-muted-foreground mt-2 font-mono">
              Evaluation Reason: {evalResult.reason}
            </p>
          )}
        </div>
      )}

      <div className="flex justify-end pt-3 border-t border-border">
        <Button variant="outline" onClick={onClose} className="cursor-pointer">
          Close
        </Button>
      </div>
    </div>
  );
}

export default FeatureFlagsPage;