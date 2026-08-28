"use client";

import * as React from "react";
import { useAuth } from "@/components/custom/authContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Save, Bell, Globe, Palette, Database } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "next-themes";

export function SettingsPage() {
  const { role } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [notifications, setNotifications] = React.useState({
    email: true,
    weekly: false,
    security: true,
  });

  React.useEffect(() => setMounted(true), []);

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("General settings saved");
  };

  const handleSaveNotifications = async (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Notification preferences saved");
  };

  const handleSaveAppearance = async (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Appearance settings saved");
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your application preferences and configuration.</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general"><Globe className="size-4 mr-2" />General</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="size-4 mr-2" />Notifications</TabsTrigger>
          <TabsTrigger value="appearance"><Palette className="size-4 mr-2" />Appearance</TabsTrigger>
          {role === "ADMIN" && <TabsTrigger value="system"><Database className="size-4 mr-2" />System</TabsTrigger>}
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveGeneral} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Application Name</label>
                  <Input defaultValue="FlagShip" disabled />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Default Environment</label>
                  <select className="w-full h-8 px-2.5 border border-input bg-background rounded-none text-sm">
                    <option value="DEVELOPMENT">Development</option>
                    <option value="PRODUCTION">Production</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Timezone</label>
                  <select className="w-full h-8 px-2.5 border border-input bg-background rounded-none text-sm">
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="Europe/London">London</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date Format</label>
                  <select className="w-full h-8 px-2.5 border border-input bg-background rounded-none text-sm">
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
                <div className="flex justify-end pt-4 border-t border-border">
                  <Button type="submit"><Save className="size-4 mr-2" />Save Changes</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveNotifications} className="space-y-4">
                <div className="space-y-4">
                  <label className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-muted-foreground">Receive email updates about flag changes</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.email}
                      onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
                      className="rounded-none border-input"
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Weekly Digest</p>
                      <p className="text-sm text-muted-foreground">Receive a weekly summary of flag activity</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.weekly}
                      onChange={(e) => setNotifications({ ...notifications, weekly: e.target.checked })}
                      className="rounded-none border-input"
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Security Alerts</p>
                      <p className="text-sm text-muted-foreground">Get notified about security-related changes</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.security}
                      onChange={(e) => setNotifications({ ...notifications, security: e.target.checked })}
                      className="rounded-none border-input"
                    />
                  </label>
                </div>
                <div className="flex justify-end pt-4 border-t border-border">
                  <Button type="submit"><Save className="size-4 mr-2" />Save Preferences</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveAppearance} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-3">Theme</label>
                  <div className="flex gap-3">
                    {["light", "dark", "system"].map((t) => (
                      <Button
                        key={t}
                        type="button"
                        variant={theme === t ? "default" : "outline"}
                        onClick={() => setTheme(t as "light" | "dark" | "system")}
                        className="flex-1"
                      >
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Font Size</label>
                  <select className="w-full h-8 px-2.5 border border-input bg-background rounded-none text-sm">
                    <option value="small">Small</option>
                    <option value="medium" selected>Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Compact Mode</label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded-none border-input" />
                    <span className="text-sm">Use compact spacing</span>
                  </label>
                </div>
                <div className="flex justify-end pt-4 border-t border-border">
                  <Button type="submit"><Save className="size-4 mr-2" />Save Appearance</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {role === "ADMIN" && (
          <TabsContent value="system">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 border border-border rounded-none">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Maintenance Mode</p>
                      <p className="text-sm text-muted-foreground">Enable maintenance mode to restrict access</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
                <div className="p-4 border border-border rounded-none">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">API Rate Limiting</p>
                      <p className="text-sm text-muted-foreground">Enable rate limiting for API endpoints</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
                <div className="p-4 border border-border rounded-none">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Audit Logging</p>
                      <p className="text-sm text-muted-foreground">Log all flag changes for compliance</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}