"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface Column<T> {
  key: string;
  header: string;
  render?: (value: unknown, row: T, index: number) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  className?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (row: T) => string;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
  };
  sorting?: {
    sortBy: string | null;
    sortOrder: "asc" | "desc";
    onSort: (key: string) => void;
  };
  filtering?: {
    globalFilter: string;
    onGlobalFilterChange: (value: string) => void;
    columnFilters: Record<string, string>;
    onColumnFilterChange: (key: string, value: string) => void;
  };
  selection?: {
    selectedKeys: Set<string>;
    onSelectionChange: (keys: Set<string>) => void;
  };
  actions?: {
    label: string;
    icon?: React.ReactNode;
    onClick: (row: T) => void;
    variant?: "default" | "outline" | "ghost" | "destructive";
  }[];
  loading?: boolean;
  emptyMessage?: string;
  striped?: boolean;
  hoverable?: boolean;
  className?: string;
}

function DataTableHeader<T>({
  columns,
  sorting,
  filtering,
}: {
  columns: Column<T>[];
  sorting?: DataTableProps<T>["sorting"];
  filtering?: DataTableProps<T>["filtering"];
}) {
  return (
    <thead className="border-b border-border">
      <tr className="hover:bg-muted/50">
        {columns.map((column) => (
          <th
            key={column.key}
            className={cn(
              "px-3 py-2 text-left text-xs font-medium text-muted-foreground whitespace-nowrap",
              column.sortable && "cursor-pointer select-none hover:text-foreground",
              column.className
            )}
            style={{ width: column.width }}
            onClick={() => column.sortable && sorting?.onSort?.(column.key)}
          >
            <div className="flex items-center gap-1.5">
              {column.filterable && filtering && (
                <Input
                  type="text"
                  placeholder={`Filter ${column.header}`}
                  value={filtering.columnFilters[column.key] || ""}
                  onChange={(e) => filtering.onColumnFilterChange?.(column.key, e.target.value)}
                  className="w-32 h-6 text-xs"
                  aria-label={`Filter ${column.header}`}
                />
              )}
              <span>{column.header}</span>
              {column.sortable && sorting && sorting.sortBy === column.key && (
                <span className="inline-flex">
                  {sorting.sortOrder === "asc" ? (
                    <ChevronUp className="size-3.5" />
                  ) : (
                    <ChevronDown className="size-3.5" />
                  )}
                </span>
              )}
            </div>
          </th>
        ))}
      </tr>
    </thead>
  );
}

function DataTableBody<T>({
  data,
  columns,
  keyExtractor,
  selection,
  actions,
  emptyMessage = "No data available",
  striped = true,
  hoverable = true,
}: Pick<DataTableProps<T>, "data" | "columns" | "keyExtractor" | "selection" | "actions" | "emptyMessage" | "striped" | "hoverable">) {
  if (data.length === 0) {
    return (
      <tbody>
        <tr>
          <td colSpan={columns.length} className="px-3 py-8 text-center text-muted-foreground">
            {emptyMessage}
          </td>
        </tr>
      </tbody>
    );
  }

  return (
    <tbody>
      {data.map((row, rowIndex) => {
        const key = keyExtractor(row);
        const isSelected = selection?.selectedKeys.has(key);
        return (
          <tr
            key={key}
            className={cn(
              "border-b border-border/50 transition-colors",
              striped && rowIndex % 2 === 1 && "bg-muted/30",
              hoverable && "hover:bg-muted/50",
              isSelected && "bg-primary/5"
            )}
          >
            {columns.map((column) => (
              <td key={column.key} className={cn("px-3 py-2 text-xs", column.className)}>
                {column.render
                  ? column.render((row as Record<string, unknown>)[column.key], row, rowIndex)
                  : String((row as Record<string, unknown>)[column.key] ?? "")}
              </td>
            ))}
            {actions && actions.length > 0 && (
              <td className="px-3 py-2 text-right">
                <div className="flex items-center justify-end gap-1">
                  {actions.map((action, index) => (
                    <Button
                      key={index}
                      variant={action.variant || "ghost"}
                      size="icon"
                      onClick={() => action.onClick(row)}
                      className="h-7 w-7"
                      aria-label={action.label}
                    >
                      {action.icon}
                    </Button>
                  ))}
                </div>
              </td>
            )}
          </tr>
        );
      })}
    </tbody>
  );
}

function DataTablePagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
}: NonNullable<DataTableProps<unknown>["pagination"]>) {
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 border-t border-border">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>Showing {start} to {end} of {total} entries</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="h-6 px-2 text-xs border border-input bg-background rounded-none"
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(1)}
          disabled={page === 1}
          className="h-7 w-7"
          aria-label="First page"
        >
          <ChevronFirst className="size-3.5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="h-7 w-7"
          aria-label="Previous page"
        >
          <ChevronLeft className="size-3.5" />
        </Button>
        <span className="px-2 text-xs text-muted-foreground">
          Page {page} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="h-7 w-7"
          aria-label="Next page"
        >
          <ChevronRight className="size-3.5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(totalPages)}
          disabled={page === totalPages}
          className="h-7 w-7"
          aria-label="Last page"
        >
          <ChevronLast className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  pagination,
  sorting,
  filtering,
  selection,
  actions,
  loading = false,
  emptyMessage,
  striped = true,
  hoverable = true,
  className,
}: DataTableProps<T>) {
  // const handleSelectAll = React.useCallback(() => {
  //   if (selection) {
  //     const allKeys = new Set<string>(data.map(keyExtractor));
  //     const newSelection = selection.selectedKeys.size === data.length ? new Set<string>() : allKeys;
  //     selection.onSelectionChange(newSelection);
  //   }
  // }, [data, keyExtractor, selection]);

  return (
    <div className={cn("border border-border rounded-none overflow-hidden relative", className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm" role="grid">
          <DataTableHeader
            columns={columns}
            sorting={sorting}
            filtering={filtering}
          />
          <DataTableBody
            data={data}
            columns={columns}
            keyExtractor={keyExtractor}
            selection={selection}
            actions={actions}
            emptyMessage={emptyMessage}
            striped={striped}
            hoverable={hoverable}
          />
        </table>
      </div>
      {pagination && <DataTablePagination {...pagination} />}
      {loading && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      )}
    </div>
  );
}

function ChevronUp({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m18 15-6-6-6 6" />
    </svg>
  );
}

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function ChevronFirst({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18.5 18H21V6H18.5" />
      <path d="M2.5 6H5V18H2.5" />
    </svg>
  );
}

function ChevronLast({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5.5 18H3V6H5.5" />
      <path d="M21.5 6H19V18H21.5" />
    </svg>
  );
}