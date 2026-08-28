"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/lib/api-services";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Key, Save, Loader2 } from "lucide-react";
import { useAuth } from "@/components/custom/authContext";
import { toast } from "sonner";

export function ProfilePage() {
  const { user, fetchUser, token } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = React.useState<"profile" | "security" | "preferences">("profile");

  const { data: userData } = useQuery({
    queryKey: ["user", "me"],
    queryFn: () => userService.getMe(),
    enabled: !!token,
    staleTime: 60000,
  });

  const profileData = userData?.data || user;

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { username: string; email: string }) => {
      // Assuming there's an update endpoint
      const response = await fetch(`${import.meta.env.VITE_API_URL}/user/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "me"] });
      fetchUser();
      toast.success("Profile updated successfully");
    },
    onError: () => toast.error("Failed to update profile"),
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/user/password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    onSuccess: () => toast.success("Password changed successfully"),
    onError: () => toast.error("Failed to change password"),
  });

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      <div className="flex gap-4 border-b border-border mb-6">
        {(["profile", "security", "preferences"] as const).map((tab) => (
          <Button
            key={tab}
            variant="ghost"
            className="h-10 px-4 text-sm"
            onClick={() => setActiveTab(tab)}
            data-state={activeTab === tab ? "active" : "inactive"}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Button>
        ))}
      </div>

      {activeTab === "profile" && (
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="size-10 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-medium">{profileData?.username || "User"}</h3>
                <p className="text-muted-foreground">{profileData?.email || "No email"}</p>
                <Badge variant="outline" className="mt-2 capitalize">
                  {(profileData?.groups?.find((g: any) => g.name === "ADMIN") ? "admin" : "user") as string}
                </Badge>
              </div>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); updateProfileMutation.mutate({ username: (e.target as HTMLFormElement).username.value, email: (e.target as HTMLFormElement).email.value }); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Username</label>
                <Input
                  name="username"
                  defaultValue={profileData?.username}
                  disabled={updateProfileMutation.isPending}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input
                  name="email"
                  type="email"
                  defaultValue={profileData?.email}
                  disabled={updateProfileMutation.isPending}
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={updateProfileMutation.isPending}>
                  {updateProfileMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4 mr-2" />}
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {activeTab === "security" && (
        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 border border-border rounded-none">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Key className="size-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Change Password</h4>
                    <p className="text-sm text-muted-foreground">Update your password to keep your account secure</p>
                  </div>
                </div>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); changePasswordMutation.mutate({ currentPassword: (e.target as HTMLFormElement).currentPassword.value, newPassword: (e.target as HTMLFormElement).newPassword.value }); }} className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Current Password</label>
                  <Input name="currentPassword" type="password" placeholder="Enter current password" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">New Password</label>
                  <Input name="newPassword" type="password" placeholder="Enter new password" required minLength={8} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Confirm New Password</label>
                  <Input type="password" placeholder="Confirm new password" required minLength={8} />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={changePasswordMutation.isPending}>
                    {changePasswordMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Key className="size-4 mr-2" />}
                    Change Password
                  </Button>
                </div>
              </form>
            </div>

            <div className="p-4 border border-border rounded-none">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-green-100 flex items-center justify-center">
                    <User className="size-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Two-Factor Authentication</h4>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                  </div>
                </div>
                <Button variant="outline">Enable 2FA</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "preferences" && (
        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-medium mb-4">Theme</h4>
              <div className="flex items-center gap-4">
                <Button variant="outline" className="w-32">Light</Button>
                <Button variant="outline" className="w-32">Dark</Button>
                <Button variant="outline" className="w-32">System</Button>
              </div>
            </div>
            <div className="pt-4 border-t border-border">
              <h4 className="font-medium mb-4">Notifications</h4>
              <div className="space-y-3">
                <label className="flex items-center justify-between">
                  <span className="text-sm">Email notifications for flag changes</span>
                  <input type="checkbox" className="rounded-none border-input" defaultChecked />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm">Weekly digest email</span>
                  <input type="checkbox" className="rounded-none border-input" />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm">Security alerts</span>
                  <input type="checkbox" className="rounded-none border-input" defaultChecked />
                </label>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-muted-foreground">User ID</dt>
              <dd className="font-mono">{profileData?.id || "N/A"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Status</dt>
              <dd className="capitalize">{profileData?.userStatus || "active"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Member Since</dt>
              <dd>{profileData?.createdAt ? new Date(profileData.createdAt).toLocaleDateString() : "N/A"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Groups</dt>
              <dd>{profileData?.groups?.map((g: any) => g.name).join(", ") || "None"}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}