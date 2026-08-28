"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { groupService } from "@/lib/api-services";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"
import { Modal, ConfirmModal } from "@/components/ui/modal";
import { Plus, Search, RefreshCw, Users, UserPlus, Edit, Trash2 } from "lucide-react";
import { DataTable, type Column } from "@/components/ui/data-table";
import { toast } from "sonner";

export function GroupsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = React.useState("");
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [showManageUsersModal, setShowManageUsersModal] = React.useState(false);
  const [selectedGroup, setSelectedGroup] = React.useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = React.useState<string | null>(null);

  const { data: groupsData, isLoading, refetch } = useQuery({
    queryKey: ["groups", search],
    queryFn: () => groupService.getAll({ search }),
    staleTime: 30000,
  });

  const groups = groupsData?.data || [];

  const columns: Column<any>[] = [
    { key: "name", header: "Name", sortable: true },
    { key: "totalUsers", header: "Users", sortable: true },
    { key: "createdAt", header: "Created", sortable: true, render: (v) => new Date(v as string).toLocaleDateString() },
    {
      key: "actions",
      header: "Actions",
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => { setSelectedGroup(row); setShowManageUsersModal(true); }} className="h-7 w-7" aria-label="Manage users">
            <Users className="size-3.5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => { setSelectedGroup(row); setShowEditModal(true); }} className="h-7 w-7" aria-label="Edit">
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
    mutationFn: (name: string) => groupService.create(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      setShowCreateModal(false);
      toast.success("Group created successfully");
    },
    onError: (error: any) => toast.error(error.response?.data?.message || "Failed to create group"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ groupId, name }: { groupId: string; name: string }) => groupService.updateName(groupId, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      setShowEditModal(false);
      toast.success("Group updated successfully");
    },
    onError: (error: any) => toast.error(error.response?.data?.message || "Failed to update group"),
  });

  const deleteMutation = useMutation({
    mutationFn: (groupId: string) => groupService.delete(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      setDeleteConfirm(null);
      toast.success("Group deleted successfully");
    },
    onError: (error: any) => toast.error(error.response?.data?.message || "Failed to delete group"),
  });

  const addUserMutation = useMutation({
    mutationFn: ({ groupId, email }: { groupId: string; email: string }) => groupService.addUser(groupId, email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      toast.success("User added to group");
    },
    onError: (error: any) => toast.error(error.response?.data?.message || "Failed to add user"),
  });

  const removeUserMutation = useMutation({
    mutationFn: ({ groupId, email }: { groupId: string; email: string }) => groupService.removeUser(groupId, email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      toast.success("User removed from group");
    },
    onError: (error: any) => toast.error(error.response?.data?.message || "Failed to remove user"),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Groups</h1>
          <p className="text-muted-foreground">Manage user groups for feature flag targeting.</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="size-4 mr-2" />
          Create Group
        </Button>
      </div>

      <div className="flex gap-4 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search groups..."
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
        data={groups}
        columns={columns}
        keyExtractor={(row) => row.id}
        loading={isLoading}
        emptyMessage="No groups found. Create your first group!"
      />

      <Modal open={showCreateModal} onOpenChange={setShowCreateModal} title="Create Group">
        <GroupForm onSubmit={(name) => createMutation.mutate(name)} onCancel={() => setShowCreateModal(false)} loading={createMutation.isPending} />
      </Modal>

      <Modal open={showEditModal} onOpenChange={setShowEditModal} title="Edit Group">
        {selectedGroup && (
          <GroupForm
            defaultName={selectedGroup.name}
            onSubmit={(name) => updateMutation.mutate({ groupId: selectedGroup.id, name })}
            onCancel={() => setShowEditModal(false)}
            loading={updateMutation.isPending}
          />
        )}
      </Modal>

      <Modal open={showManageUsersModal} onOpenChange={setShowManageUsersModal} title="Manage Group Users" size="lg">
        {selectedGroup && (
          <ManageGroupUsers
            group={selectedGroup}
            onClose={() => setShowManageUsersModal(false)}
            onAddUser={(email) => addUserMutation.mutate({ groupId: selectedGroup.id, email })}
            onRemoveUser={(email) => removeUserMutation.mutate({ groupId: selectedGroup.id, email })}
            adding={addUserMutation.isPending}
            removing={false}
          />
        )}
      </Modal>

      <ConfirmModal
        open={!!deleteConfirm}
        onOpenChange={(open) => { if (!open) setDeleteConfirm(null); }}
        title="Delete Group"
        message="Are you sure you want to delete this group? This will remove all users from the group."
        variant="destructive"
        onConfirm={() => { if (deleteConfirm) deleteMutation.mutate(deleteConfirm); }}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}

function GroupForm({ onSubmit, onCancel, loading, defaultName = "" }: { onSubmit: (name: string) => void; onCancel: () => void; loading: boolean; defaultName?: string }) {
  const [name, setName] = React.useState(defaultName);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) onSubmit(name.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Group Name</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter group name"
          required
          autoFocus
        />
      </div>
      <div className="flex justify-end gap-2 pt-4 border-t border-border">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>Cancel</Button>
        <Button type="submit" disabled={loading || !name.trim()}>{loading ? "Saving..." : "Save"}</Button>
      </div>
    </form>
  );
}

function ManageGroupUsers({
  group,
  onClose,
  onAddUser,
  adding,
}: {
  group: any;
  onClose: () => void;
  onAddUser: (email: string) => void;
  onRemoveUser: (email: string) => void;
  adding: boolean;
  removing: boolean;
}) {
  const [email, setEmail] = React.useState("");

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      onAddUser(email.trim());
      setEmail("");
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleAddUser} className="flex gap-2">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter user email to add"
          className="flex-1"
          required
        />
        <Button type="submit" disabled={adding || !email.trim()}>
          {adding ? "Adding..." : <UserPlus className="size-4" />}
        </Button>
      </form>

      <div className="max-h-60 overflow-y-auto border border-border rounded-none">
        {group.totalUsers === 0 ? (
          <div className="p-4 text-center text-muted-foreground text-sm">No users in this group</div>
        ) : (
          <ul className="divide-y divide-border">
            {[] as any[]} // This would be populated with actual users from a separate API call
          </ul>
        )}
      </div>
      <p className="text-sm text-muted-foreground">User list management requires additional API endpoint. Users can be added by email above.</p>

      <div className="flex justify-end gap-2 pt-4 border-t border-border">
        <Button variant="outline" onClick={onClose}>Close</Button>
      </div>
    </div>
  );
}