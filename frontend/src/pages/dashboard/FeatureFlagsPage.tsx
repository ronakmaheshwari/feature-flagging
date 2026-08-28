"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FlagCard } from "@/components/ui/flag-card";
import { featureFlagService } from "@/lib/api-services";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"
import { Modal, ConfirmModal } from "@/components/ui/modal";
import { Plus, Search, RefreshCw } from "lucide-react";
import { useAuth } from "@/components/custom/authContext";
import { toast } from "sonner";

export function FeatureFlagsPage() {
  const { role } = useAuth();
  const isAdmin = role === "ADMIN";
  const queryClient = useQueryClient();
  const [search, setSearch] = React.useState("");
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [showRulesModal, setShowRulesModal] = React.useState(false);
  const [selectedFlag, setSelectedFlag] = React.useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = React.useState<string | null>(null);

  const { data: flagsData, refetch } = useQuery({
    queryKey: ["flags", "all", search],
    queryFn: () => isAdmin ? featureFlagService.getAll() : featureFlagService.getNames(true),
    staleTime: 30000,
  });

  const flags = flagsData?.data || [];

  const filteredFlags = flags.filter((flag: any) =>
    flag.name.toLowerCase().includes(search.toLowerCase()) ||
    flag.id.toLowerCase().includes(search.toLowerCase())
  );

  const toggleMutation = useMutation({
    mutationFn: ({ flagId, isEnabled }: { flagId: string; isEnabled: boolean }) =>
      featureFlagService.toggle(flagId, isEnabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flags"] });
      toast.success("Flag updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update flag");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (flagId: string) => featureFlagService.delete(flagId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flags"] });
      setDeleteConfirm(null);
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
      toast.success("Flag created successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create flag");
    },
  });

  const handleToggle = (flagId: string, enabled: boolean) => {
    toggleMutation.mutate({ flagId, isEnabled: enabled });
  };

  const handleDelete = (flagId: string) => {
    setDeleteConfirm(flagId);
  };

  const handleCreate = (data: any) => {
    createMutation.mutate(data);
  };

  const handleManageRules = (flag: any) => {
    setSelectedFlag(flag);
    setShowRulesModal(true);
  };

  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Feature Flags</h1>
            <p className="text-muted-foreground">View and evaluate feature flags available to you.</p>
          </div>
        </div>

        <div className="flex gap-4 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search flags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="size-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredFlags.length === 0 ? (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              <p>No flags found</p>
            </div>
          ) : (
            filteredFlags.map((flag: any) => (
              <FlagCard key={flag.id} flag={flag} variant="detailed" showActions={false} />
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Feature Flags</h1>
          <p className="text-muted-foreground">Manage all feature flags in the system.</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="size-4 mr-2" />
          Create Flag
        </Button>
      </div>

      <div className="flex gap-4 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search flags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="size-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredFlags.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <p>No flags found. Create your first feature flag!</p>
            <Button className="mt-4" onClick={() => setShowCreateModal(true)}>
              Create Flag
            </Button>
          </div>
        ) : (
          filteredFlags.map((flag: any) => (
            <FlagCard
              key={flag.id}
              flag={flag}
              onToggle={handleToggle}
              onEdit={() => {}}
              onDelete={handleDelete}
              onViewDetails={() => {}}
              onManageRules={handleManageRules}
              loading={toggleMutation.isPending || deleteMutation.isPending}
            />
          ))
        )}
      </div>

      <Modal open={showCreateModal} onOpenChange={setShowCreateModal} title="Create Feature Flag" size="lg">
        <CreateFlagForm onSubmit={handleCreate} onCancel={() => setShowCreateModal(false)} loading={createMutation.isPending} />
      </Modal>

      <ConfirmModal
        open={!!deleteConfirm}
        onOpenChange={(open) => { if (!open) setDeleteConfirm(null); }}
        title="Delete Flag"
        message="Are you sure you want to delete this flag? This action cannot be undone."
        variant="destructive"
        onConfirm={() => { if (deleteConfirm) deleteMutation.mutate(deleteConfirm); }}
        loading={deleteMutation.isPending}
      />

      <Modal open={showRulesModal} onOpenChange={setShowRulesModal} title="Manage Flag Rules" size="xl">
        {selectedFlag && <FlagRulesForm flag={selectedFlag} onClose={() => setShowRulesModal(false)} />}
      </Modal>
    </div>
  );
}

function CreateFlagForm({ onSubmit, onCancel, loading }: { onSubmit: (data: any) => void; onCancel: () => void; loading: boolean }) {
  const [formData, setFormData] = React.useState({
    name: "",
    is_enabled: false,
    environment: "DEVELOPMENT",
    rollout: 0,
    whitelist: [] as string[],
    blacklist: [] as string[],
    groups: [] as string[],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Flag Name</label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="my-feature-flag"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Environment</label>
        <select
          value={formData.environment}
          onChange={(e) => setFormData({ ...formData, environment: e.target.value as "DEVELOPMENT" | "PRODUCTION" })}
          className="w-full h-8 px-2.5 border border-input bg-background rounded-none text-sm"
        >
          <option value="DEVELOPMENT">Development</option>
          <option value="PRODUCTION">Production</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Rollout Percentage</label>
        <Input
          type="number"
          min="0"
          max="100"
          value={formData.rollout}
          onChange={(e) => setFormData({ ...formData, rollout: Number(e.target.value) })}
        />
      </div>
      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.is_enabled}
            onChange={(e) => setFormData({ ...formData, is_enabled: e.target.checked })}
            className="rounded-none border-input"
          />
          <span className="text-sm">Enable flag immediately</span>
        </label>
      </div>
      <div className="flex justify-end gap-2 pt-4 border-t border-border">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>Cancel</Button>
        <Button type="submit" disabled={loading}>{loading ? "Creating..." : "Create Flag"}</Button>
      </div>
    </form>
  );
}

function FlagRulesForm({ flag, onClose }: { flag: any; onClose: () => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="font-medium mb-3">Rollout</h4>
        <Input type="number" min="0" max="100" defaultValue={flag.rules?.rollout || flag.rollout || 0} />
      </div>
      <div>
        <h4 className="font-medium mb-3">Whitelist Users</h4>
        <p className="text-sm text-muted-foreground">User IDs that will always have this flag enabled</p>
      </div>
      <div>
        <h4 className="font-medium mb-3">Blacklist Users</h4>
        <p className="text-sm text-muted-foreground">User IDs that will never have this flag enabled</p>
      </div>
      <div>
        <h4 className="font-medium mb-3">Groups</h4>
        <p className="text-sm text-muted-foreground">Groups that will have this flag enabled</p>
      </div>
      <div className="flex justify-end gap-2 pt-4 border-t border-border">
        <Button variant="outline" onClick={onClose}>Close</Button>
        <Button>Save Rules</Button>
      </div>
    </div>
  );
}