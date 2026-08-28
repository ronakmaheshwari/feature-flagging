"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { contentService } from "@/lib/api-services";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"
import { Modal, ConfirmModal } from "@/components/ui/modal";
import { Plus, Search, RefreshCw, Edit, Trash2, Send } from "lucide-react";
import { DataTable, type Column } from "@/components/ui/data-table";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const platforms = ["LinkedIn", "X", "Instagram", "Threads", "Facebook", "Blog"] as const;
const statuses = ["DRAFT", "POSTED", "DELETED"] as const;

export function ContentPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("");
  const [platformFilter, setPlatformFilter] = React.useState<string>("");
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [selectedContent, setSelectedContent] = React.useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = React.useState<string | null>(null);

  const { data: contentData, isLoading, refetch } = useQuery({
    queryKey: ["content", search, statusFilter, platformFilter],
    queryFn: () => contentService.getAll({ content: search, status: statusFilter || undefined, platform: platformFilter || undefined }),
    staleTime: 30000,
  });

  const content = contentData?.data || [];

  const columns: Column<any>[] = [
    { key: "topic", header: "Topic", sortable: true },
    {
      key: "platform",
      header: "Platform",
      render: (v) => <Badge variant="secondary">{v as string}</Badge>,
      sortable: true,
      filterable: true,
    },
    {
      key: "status",
      header: "Status",
      render: (v) => {
        const status = v as string;
        if (status === "POSTED") return <Badge variant="default">{status}</Badge>;
        if (status === "DRAFT") return <Badge variant="secondary">{status}</Badge>;
        return <Badge variant="destructive">{status}</Badge>;
      },
      sortable: true,
      filterable: true,
    },
    { key: "createdAt", header: "Created", sortable: true, render: (v) => new Date(v as string).toLocaleDateString() },
    {
      key: "actions",
      header: "Actions",
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1">
          {row.status === "DRAFT" && (
            <Button variant="ghost" size="icon" onClick={() => {}} className="h-7 w-7" aria-label="Post">
              <Send className="size-3.5" />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={() => { setSelectedContent(row); setShowEditModal(true); }} className="h-7 w-7" aria-label="Edit">
            <Edit className="size-3.5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm(row.id)} className="h-7 w-7 text-destructive" aria-label="Delete">
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  const createMutation = useMutation({
    mutationFn: (data: any) => contentService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content"] });
      setShowCreateModal(false);
      toast.success("Content created successfully");
    },
    onError: (error: any) => toast.error(error.response?.data?.message || "Failed to create content"),
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => contentService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content"] });
      setShowEditModal(false);
      toast.success("Content updated successfully");
    },
    onError: (error: any) => toast.error(error.response?.data?.message || "Failed to update content"),
  });

  const deleteMutation = useMutation({
    mutationFn: (contentId: string) => contentService.delete(contentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content"] });
      setDeleteConfirm(null);
      toast.success("Content deleted successfully");
    },
    onError: (error: any) => toast.error(error.response?.data?.message || "Failed to delete content"),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Content Management</h1>
          <p className="text-muted-foreground">Create and manage your social media content.</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="size-4 mr-2" />
          Create Content
        </Button>
      </div>

      <div className="flex flex-wrap gap-4 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search content..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="relative min-w-[150px]">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full h-8 pl-8 pr-8 border border-input bg-background rounded-none text-sm appearance-none"
          >
            <option value="">All Status</option>
            {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="relative min-w-[150px]">
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="w-full h-8 pl-8 pr-8 border border-input bg-background rounded-none text-sm appearance-none"
          >
            <option value="">All Platforms</option>
            {platforms.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="size-4 mr-2" />
          Refresh
        </Button>
      </div>

      <DataTable
        data={content}
        columns={columns}
        keyExtractor={(row) => row.id}
        loading={isLoading}
        emptyMessage="No content found. Create your first post!"
      />

      <Modal open={showCreateModal} onOpenChange={setShowCreateModal} title="Create Content" size="lg">
        <ContentForm onSubmit={createMutation.mutate} onCancel={() => setShowCreateModal(false)} loading={createMutation.isPending} />
      </Modal>

      <Modal open={showEditModal} onOpenChange={setShowEditModal} title="Edit Content" size="lg">
        {selectedContent && (
          <ContentForm
            defaultValues={selectedContent}
            onSubmit={updateMutation.mutate}
            onCancel={() => setShowEditModal(false)}
            loading={updateMutation.isPending}
          />
        )}
      </Modal>

      <ConfirmModal
        open={!!deleteConfirm}
        onOpenChange={(open) => { if (!open) setDeleteConfirm(null); }}
        title="Delete Content"
        message="Are you sure you want to delete this content? This action cannot be undone."
        variant="destructive"
        onConfirm={() => { if (deleteConfirm) deleteMutation.mutate(deleteConfirm); }}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}

function ContentForm({
  onSubmit,
  onCancel,
  loading,
  defaultValues,
}: {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  loading: boolean;
  defaultValues?: any;
}) {
  const [formData, setFormData] = React.useState({
    topic: defaultValues?.topic || "",
    content: defaultValues?.content || "",
    platform: defaultValues?.platform || "LinkedIn",
    status: defaultValues?.status || "DRAFT",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Topic</label>
        <Input
          value={formData.topic}
          onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
          placeholder="Content topic/title"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Content</label>
        <textarea
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          placeholder="Write your content here..."
          className="w-full min-h-[150px] p-2.5 border border-input bg-background rounded-none text-sm resize-y"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Platform</label>
          <select
            value={formData.platform}
            onChange={(e) => setFormData({ ...formData, platform: e.target.value as typeof platforms[number] })}
            className="w-full h-8 px-2.5 border border-input bg-background rounded-none text-sm"
          >
            {platforms.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as typeof statuses[number] })}
            className="w-full h-8 px-2.5 border border-input bg-background rounded-none text-sm"
          >
            {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-4 border-t border-border">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>Cancel</Button>
        <Button type="submit" disabled={loading}>{loading ? "Saving..." : defaultValues ? "Update" : "Create"}</Button>
      </div>
    </form>
  );
}