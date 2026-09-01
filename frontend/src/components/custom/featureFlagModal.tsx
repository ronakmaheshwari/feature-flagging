"use client";

import * as React from "react";
import { Search, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  featureFlagService,
  groupService,
  userService,
  type Group,
  type UserData,
  type FeatureFlagDetail,
  type FeatureFlag,
} from "@/lib/api-services";

interface FlagRulesFormProps {
  flag: FeatureFlagDetail | FeatureFlag;
  onClose: () => void;
  onSave?: (data: {
    flagId: string;
    rollout: number;
    rules: { blacklist: string[]; whitelist: string[]; groups: string[] };
  }) => Promise<void> | void;
}

interface SelectOption {
  id: string;
  label: string;
  description?: string;
}

interface RuleMultiSelectProps {
  title: string;
  description: string;
  options: SelectOption[];
  selected: string[];
  search: string;
  onSearchChange: (value: string) => void;
  onChange: (values: string[]) => void;
  loading?: boolean;
  emptyMessage?: string;
}

function RuleMultiSelect({
  title,
  description,
  options,
  selected,
  search,
  onSearchChange,
  onChange,
  loading = false,
  emptyMessage = "No options available",
}: RuleMultiSelectProps) {
  const toggleItem = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((value) => value !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  const removeItem = (id: string) => {
    onChange(selected.filter((value) => value !== id));
  };

  return (
    <div className="rounded-lg border border-border bg-background">
      {/* Header */}
      <div className="border-b border-border p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h4 className="font-medium">{title}</h4>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
          <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
            {selected.length} selected
          </span>
        </div>

        {/* Search */}
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={`Search ${title.toLowerCase()}...`}
            className="pl-9"
          />
        </div>
      </div>

      {/* Selected */}
      {selected.length > 0 && (
        <div className="border-b border-border bg-muted/30 p-3">
          <div className="flex flex-wrap gap-2">
            {selected.map((id) => {
              const option = options.find((item) => item.id === id);
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => removeItem(id)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-xs hover:bg-muted cursor-pointer"
                >
                  <span>{option?.label ?? id}</span>
                  <X className="size-3" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Options */}
      <div className="max-h-52 overflow-y-auto p-2">
        {loading ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Loading...
          </div>
        ) : options.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            {search ? `No ${title.toLowerCase()} found` : emptyMessage}
          </div>
        ) : (
          <div className="space-y-1">
            {options.map((item) => {
              const isSelected = selected.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  className={[
                    "flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left text-sm transition-colors cursor-pointer",
                    isSelected
                      ? "bg-primary/10 text-primary font-medium"
                      : "hover:bg-muted",
                  ].join(" ")}
                >
                  <div className="min-w-0">
                    <div className="truncate font-medium">{item.label}</div>
                    {item.description && (
                      <div className="truncate text-xs text-muted-foreground">
                        {item.description}
                      </div>
                    )}
                  </div>
                  <span
                    className={[
                      "ml-3 flex size-5 shrink-0 items-center justify-center rounded border",
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-input bg-background",
                    ].join(" ")}
                  >
                    {isSelected && <Check className="size-3.5" />}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export function FlagRulesForm({ flag, onClose, onSave }: FlagRulesFormProps) {
  const [rollout, setRollout] = React.useState<number>(flag.rollout ?? 0);

  const [groups, setGroups] = React.useState<string[]>(() => {
    const rawFlag = flag as any;
    if (Array.isArray(rawFlag.groups)) {
      return rawFlag.groups.map((g: any) => (typeof g === "string" ? g : g.id));
    }
    if (Array.isArray(rawFlag.rules?.groups)) {
      return rawFlag.rules.groups;
    }
    return [];
  });

  const [whitelist, setWhitelist] = React.useState<string[]>(() => {
    const rawFlag = flag as any;
    if (Array.isArray(rawFlag.whitelist)) {
      return rawFlag.whitelist.map((u: any) => (typeof u === "string" ? u : u.userId));
    }
    if (Array.isArray(rawFlag.rules?.whitelist)) {
      return rawFlag.rules.whitelist.map((u: any) => (typeof u === "string" ? u : u.userId));
    }
    return [];
  });

  const [blacklist, setBlacklist] = React.useState<string[]>(() => {
    const rawFlag = flag as any;
    if (Array.isArray(rawFlag.blacklist)) {
      return rawFlag.blacklist.map((u: any) => (typeof u === "string" ? u : u.userId));
    }
    if (Array.isArray(rawFlag.rules?.blacklist)) {
      return rawFlag.rules.blacklist.map((u: any) => (typeof u === "string" ? u : u.userId));
    }
    return [];
  });

  const [availableGroups, setAvailableGroups] = React.useState<Group[]>([]);
  const [availableUsers, setAvailableUsers] = React.useState<UserData[]>([]);

  const [groupSearch, setGroupSearch] = React.useState("");
  const [whitelistSearch, setWhitelistSearch] = React.useState("");
  const [blacklistSearch, setBlacklistSearch] = React.useState("");

  const [groupsLoading, setGroupsLoading] = React.useState(false);
  const [whitelistLoading, setWhitelistLoading] = React.useState(false);
  const [blacklistLoading, setBlacklistLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    const loadGroups = async () => {
      try {
        setGroupsLoading(true);
        const response = await groupService.getAll({
          search: groupSearch || undefined,
        });
        if (response.success && response.data) {
          setAvailableGroups(Array.isArray(response.data) ? response.data : []);
        }
      } catch (error) {
        console.error("Failed to fetch groups:", error);
      } finally {
        setGroupsLoading(false);
      }
    };
    const timeout = setTimeout(loadGroups, 300);
    return () => clearTimeout(timeout);
  }, [groupSearch]);

  React.useEffect(() => {
    const loadUsers = async () => {
      try {
        setWhitelistLoading(true);
        const response = await userService.getUser(
          whitelistSearch || undefined,
        );
        if (response.success && response.data) {
          setAvailableUsers(Array.isArray(response.data) ? response.data : []);
        }
      } catch (error) {
        console.error("Failed to fetch whitelist users:", error);
      } finally {
        setWhitelistLoading(false);
      }
    };
    const timeout = setTimeout(loadUsers, 300);
    return () => clearTimeout(timeout);
  }, [whitelistSearch]);

  React.useEffect(() => {
    const loadUsers = async () => {
      try {
        setBlacklistLoading(true);
        const response = await userService.getUser(
          blacklistSearch || undefined,
        );
        if (response.success && response.data) {
          setAvailableUsers(Array.isArray(response.data) ? response.data : []);
        }
      } catch (error) {
        console.error("Failed to fetch blacklist users:", error);
      } finally {
        setBlacklistLoading(false);
      }
    };
    const timeout = setTimeout(loadUsers, 300);
    return () => clearTimeout(timeout);
  }, [blacklistSearch]);

  const groupOptions = React.useMemo<SelectOption[]>(
    () =>
      availableGroups.map((group) => ({
        id: group.id,
        label: group.name,
        description:
          group.totalUsers !== undefined
            ? `${group.totalUsers} users`
            : undefined,
      })),
    [availableGroups],
  );

  const userOptions = React.useMemo<SelectOption[]>(
    () =>
      availableUsers.map((user) => ({
        id: user.id,
        label: user.username,
        description: user.email,
      })),
    [availableUsers],
  );

  const hasConflict = React.useMemo(() => {
    return whitelist.some((userId) => blacklist.includes(userId));
  }, [whitelist, blacklist]);

  const handleSave = async () => {
    if (hasConflict) {
      return;
    }
    const payload = {
      flagId: flag.id,
      rollout,
      rules: { groups, whitelist, blacklist },
    };
    try {
      setSaving(true);
      if (onSave) {
        await onSave(payload);
      } else {
        await featureFlagService.updateRules(flag.id, {
          groups,
          whitelist: whitelist.map((userId) => ({ userId, group: [] })),
          blacklist: blacklist.map((userId) => ({ userId, group: [] })),
          rollout,
        });
      }
      onClose();
    } catch (error) {
      console.error("Failed to save flag rules:", error);
    } finally {
      setSaving(false);
    }
  };

  const totalRules = groups.length + whitelist.length + blacklist.length;

  return (
    <div className="flex max-h-[80vh] flex-col">
      {/* Header */}
      <div className="shrink-0 border-b border-border pb-4">
        <div>
          <h3 className="text-lg font-semibold">Manage Feature Flag Rules</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure who can access{" "}
            <span className="font-medium text-foreground">{flag.name}</span>.
          </p>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 space-y-6 overflow-y-auto py-6 pr-2">
        {/* Rollout */}
        <section>
          <div className="mb-3">
            <h4 className="font-medium">Rollout</h4>
            <p className="text-sm text-muted-foreground">
              Percentage of users who should receive this feature.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Input
              type="number"
              min={0}
              max={100}
              value={rollout}
              onChange={(e) => {
                const value = Number(e.target.value);
                if (value < 0) {
                  setRollout(0);
                } else if (value > 100) {
                  setRollout(100);
                } else {
                  setRollout(value);
                }
              }}
              className="max-w-32"
            />
            <span className="text-sm text-muted-foreground">%</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${rollout}%` }}
              />
            </div>
          </div>
        </section>

        {/* Groups */}
        <section>
          <RuleMultiSelect
            title="Groups"
            description="Users belonging to these groups will have this flag enabled."
            options={groupOptions}
            selected={groups}
            search={groupSearch}
            onSearchChange={setGroupSearch}
            onChange={setGroups}
            loading={groupsLoading}
            emptyMessage="No groups have been created yet."
          />
        </section>

        {/* Whitelist */}
        <section>
          <RuleMultiSelect
            title="Whitelist Users"
            description="These users will always have this flag enabled."
            options={userOptions}
            selected={whitelist}
            search={whitelistSearch}
            onSearchChange={setWhitelistSearch}
            onChange={setWhitelist}
            loading={whitelistLoading}
            emptyMessage="No users available."
          />
        </section>

        {/* Blacklist */}
        <section>
          <RuleMultiSelect
            title="Blacklist Users"
            description="These users will never have this flag enabled."
            options={userOptions}
            selected={blacklist}
            search={blacklistSearch}
            onSearchChange={setBlacklistSearch}
            onChange={setBlacklist}
            loading={blacklistLoading}
            emptyMessage="No users available."
          />
        </section>

        {/* Conflict warning */}
        {hasConflict && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            <strong>Warning:</strong> Some users are both whitelisted and
            blacklisted. Remove them from one of the lists before saving.
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="shrink-0 border-t border-border pt-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {totalRules} rule{totalRules !== 1 ? "s" : ""} configured
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={saving || hasConflict}
            >
              {saving ? "Saving..." : "Save Rules"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FlagRulesForm;