"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { featureFlagService } from "@/lib/api-services";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Search, RefreshCw, Clock, User, ArrowUpRight, ArrowDownLeft, Minus } from "lucide-react";

export function AuditLogsPage() {
  const [selectedFlagId, setSelectedFlagId] = React.useState<string>("");

  const { data: flagsData } = useQuery({
    queryKey: ["flags", "names"],
    queryFn: () => featureFlagService.getNames(true),
    staleTime: 60000,
  });

  const flags = flagsData?.data || [];

  const { data: auditData, isLoading, refetch } = useQuery({
    queryKey: ["audit", selectedFlagId],
    queryFn: () => featureFlagService.getAudit(selectedFlagId),
    enabled: !!selectedFlagId,
    staleTime: 30000,
  });

  const auditLogs = auditData?.data || [];

  const columns: Column<any>[] = [
    {
      key: "action",
      header: "Action",
      render: (v) => {
        const action = v as string;
        if (action.includes("ENABLE") || action.includes("CREATE") || action.includes("ADD")) {
          return <span className="inline-flex items-center gap-1 text-green-600"><ArrowUpRight className="size-3" />{action}</span>;
        }
        if (action.includes("DISABLE") || action.includes("DELETE") || action.includes("REMOVE")) {
          return <span className="inline-flex items-center gap-1 text-red-600"><ArrowDownLeft className="size-3" />{action}</span>;
        }
        return <span className="inline-flex items-center gap-1 text-blue-600"><Minus className="size-3" />{action}</span>;
      },
      sortable: true,
    },
    {
      key: "performedByUsername",
      header: "Performed By",
      render: (v, row) => (
        <div className="flex items-center gap-2">
          <User className="size-3.5 text-muted-foreground" />
          <span>{v || row.performedBy}</span>
        </div>
      ),
      sortable: true,
    },
    {
      key: "oldValue",
      header: "Previous Value",
      render: (v) => v ? (
        <pre className="text-xs bg-muted p-2 rounded-none max-h-20 overflow-auto font-mono">{JSON.stringify(v, null, 2)}</pre>
      ) : (
        <span className="text-muted-foreground">-</span>
      ),
    },
    {
      key: "newValue",
      header: "New Value",
      render: (v) => v ? (
        <pre className="text-xs bg-muted p-2 rounded-none max-h-20 overflow-auto font-mono">{JSON.stringify(v, null, 2)}</pre>
      ) : (
        <span className="text-muted-foreground">-</span>
      ),
    },
    { key: "createdAt", header: "Timestamp", sortable: true, render: (v) => new Date(v as string).toLocaleString() },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Audit Logs</h1>
          <p className="text-muted-foreground">View feature flag change history and audit trail.</p>
        </div>
      </div>

      <div className="flex gap-4 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <select
            value={selectedFlagId}
            onChange={(e) => setSelectedFlagId(e.target.value)}
            className="w-full h-8 pl-10 pr-8 border border-input bg-background rounded-none text-sm appearance-none"
          >
            <option value="">Select a feature flag...</option>
            {flags.map((flag: any) => (
              <option key={flag.id} value={flag.id}>{flag.name}</option>
            ))}
          </select>
        </div>
        <Button variant="outline" onClick={() => refetch()} disabled={!selectedFlagId}>
          <RefreshCw className="size-4 mr-2" />
          Refresh
        </Button>
      </div>

      {!selectedFlagId ? (
        <div className="text-center py-12 text-muted-foreground">
          <Clock className="size-12 mx-auto mb-4 opacity-50" />
          <p>Select a feature flag to view its audit log</p>
        </div>
      ) : auditLogs.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Clock className="size-12 mx-auto mb-4 opacity-50" />
          <p>No audit logs found for this flag</p>
        </div>
      ) : (
        <DataTable
          data={auditLogs}
          columns={columns}
          keyExtractor={(row) => row.id}
          loading={isLoading}
          emptyMessage="No audit logs found"
        />
      )}
    </div>
  );
}