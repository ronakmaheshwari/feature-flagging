"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { routeFlagService } from "@/lib/api-services";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"
import { Modal, ConfirmModal } from "@/components/ui/modal";
import { Plus, Search, RefreshCw, Edit, Trash2 } from "lucide-react";
import { DataTable, type Column } from "@/components/ui/data-table";
import { toast } from "sonner";

export function RouteFlagsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = React.useState("");
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [selectedRoute, setSelectedRoute] = React.useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = React.useState<{ method: string; path: string } | null>(null);

  const { data: routesData, isLoading, refetch } = useQuery({
    queryKey: ["route-flags"],
    queryFn: () => routeFlagService.getAll(),
    staleTime: 30000,
  });

  const routes = routesData?.data || [];

  const columns: Column<any>[] = [
    {
      key: "method",
      header: "Method",
      render: (v) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-none text-xs font-medium bg-primary/10 text-primary">
          {v as string}
        </span>
      ),
      sortable: true,
    },
    { key: "path", header: "Path", sortable: true },
    { key: "flagName", header: "Flag Name", sortable: true },
    { key: "createdAt", header: "Created", sortable: true, render: (v) => new Date(v as string).toLocaleDateString() },
    {
      key: "actions",
      header: "Actions",
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => { setSelectedRoute(row); setShowEditModal(true); }} className="h-7 w-7" aria-label="Edit">
            <Edit className="size-3.5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm({ method: row.method, path: row.path })} className="h-7 w-7 text-destructive" aria-label="Delete">
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  const createMutation = useMutation({
    mutationFn: (data: { method: string; path: string; flagName: string }) => routeFlagService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["route-flags"] });
      setShowCreateModal(false);
      toast.success("Route flag created successfully");
    },
    onError: (error: any) => toast.error(error.response?.data?.message || "Failed to create route flag"),
  });

  const updateMutation = useMutation({
    mutationFn: (data: { method: string; path: string; flagName: string }) => routeFlagService.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["route-flags"] });
      setShowEditModal(false);
      toast.success("Route flag updated successfully");
    },
    onError: (error: any) => toast.error(error.response?.data?.message || "Failed to update route flag"),
  });

  const deleteMutation = useMutation({
    mutationFn: ({ method, path }: { method: string; path: string }) => routeFlagService.delete(method, path),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["route-flags"] });
      setDeleteConfirm(null);
      toast.success("Route flag deleted successfully");
    },
    onError: (error: any) => toast.error(error.response?.data?.message || "Failed to delete route flag"),
  });

  const methods = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Route Flags</h1>
          <p className="text-muted-foreground">Map routes to feature flags for automatic evaluation.</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="size-4 mr-2" />
          Add Route Flag
        </Button>
      </div>

      <div className="flex gap-4 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search routes..."
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

      <DataTable
        data={routes}
        columns={columns}
        keyExtractor={(row) => `${row.method}:${row.path}`}
        loading={isLoading}
        emptyMessage="No route flags configured. Add your first route flag!"
      />

      <Modal open={showCreateModal} onOpenChange={setShowCreateModal} title="Add Route Flag">
        <RouteFlagForm
          methods={methods}
          onSubmit={createMutation.mutate}
          onCancel={() => setShowCreateModal(false)}
          loading={createMutation.isPending}
        />
      </Modal>

      <Modal open={showEditModal} onOpenChange={setShowEditModal} title="Edit Route Flag">
        {selectedRoute && (
          <RouteFlagForm
            methods={methods}
            defaultValues={selectedRoute}
            onSubmit={updateMutation.mutate}
            onCancel={() => setShowEditModal(false)}
            loading={updateMutation.isPending}
          />
        )}
      </Modal>

      <ConfirmModal
        open={!!deleteConfirm}
        onOpenChange={(open) => { if (!open) setDeleteConfirm(null); }}
        title="Delete Route Flag"
        message="Are you sure you want to delete this route flag mapping?"
        variant="destructive"
        onConfirm={() => { if (deleteConfirm) deleteMutation.mutate(deleteConfirm); }}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}

function RouteFlagForm({
  methods,
  onSubmit,
  onCancel,
  loading,
  defaultValues,
}: {
  methods: string[];
  onSubmit: (data: { method: string; path: string; flagName: string }) => void;
  onCancel: () => void;
  loading: boolean;
  defaultValues?: { method: string; path: string; flagName: string };
}) {
  const [formData, setFormData] = React.useState({
    method: defaultValues?.method || "GET",
    path: defaultValues?.path || "",
    flagName: defaultValues?.flagName || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">HTTP Method</label>
        <select
          value={formData.method}
          onChange={(e) => setFormData({ ...formData, method: e.target.value })}
          className="w-full h-8 px-2.5 border border-input bg-background rounded-none text-sm"
          disabled={!!defaultValues}
        >
          {methods.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Route Path</label>
        <Input
          value={formData.path}
          onChange={(e) => setFormData({ ...formData, path: e.target.value })}
          placeholder="/api/users/:id"
          required
          disabled={!!defaultValues}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Feature Flag Name</label>
        <Input
          value={formData.flagName}
          onChange={(e) => setFormData({ ...formData, flagName: e.target.value })}
          placeholder="my-feature-flag"
          required
        />
      </div>
      <div className="flex justify-end gap-2 pt-4 border-t border-border">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>Cancel</Button>
        <Button type="submit" disabled={loading || !formData.path || !formData.flagName}>
          {loading ? "Saving..." : defaultValues ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
}