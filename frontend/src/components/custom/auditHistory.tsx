import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  FileText,
  History,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
interface AuditValue {
  topic?: string;
  prompt?: string;
  status?: string;
  platform?: string;
  userContent?: string;
  promptContent?: string;
  [key: string]: unknown;
}
interface AuditLog {
  id: string;
  contentId: string;
  old_value?: Record<string, unknown>;
  new_value?: AuditValue;
  changed_at?: string;
  createdAt?: string;
  action?: string;
}
interface AuditHistoryProps {
  auditLogs: AuditLog[];
}
const AuditHistory = ({ auditLogs }: AuditHistoryProps) => {
  return (
    <div className="flex flex-col min-h-0 flex-1 overflow-hidden">
      {" "}
      {/* Header */}{" "}
      <div className="flex items-center justify-between shrink-0 pb-4 border-b">
        {" "}
        <div className="flex items-center gap-2">
          {" "}
          <div className="flex items-center justify-center size-8 rounded-lg bg-primary/10">
            {" "}
            <History className="size-4 text-primary" />{" "}
          </div>{" "}
          <div>
            {" "}
            <h2 className="text-sm font-semibold">Audit Trail</h2>{" "}
            <p className="text-xs text-muted-foreground">
              {" "}
              {auditLogs.length}{" "}
              {auditLogs.length === 1 ? "activity" : "activities"} recorded{" "}
            </p>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
      {/* Timeline */}{" "}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden pr-2 pt-5">
        {" "}
        {auditLogs.length === 0 ? (
          <EmptyAuditState />
        ) : (
          <div className="relative">
            {" "}
            {auditLogs.map((log, index) => (
              <AuditTimelineItem
                key={log.id}
                log={log}
                isLast={index === auditLogs.length - 1}
              />
            ))}{" "}
          </div>
        )}{" "}
      </div>{" "}
    </div>
  );
};
interface AuditTimelineItemProps {
  log: AuditLog;
  isLast: boolean;
}
const AuditTimelineItem = ({ log, isLast }: AuditTimelineItemProps) => {
  const [expanded, setExpanded] = useState(false);
  const value = log.new_value || {};
  const action = getAction(log);
  const actionLabel = getActionLabel(action);
  const timestamp = log.changed_at || log.createdAt;
  return (
    <div className="relative flex gap-3 min-w-0">
      {" "}
      {/* Timeline column */}{" "}
      <div className="flex flex-col items-center shrink-0">
        {" "}
        {/* Icon */}{" "}
        <div
          className={` relative z-10 flex items-center justify-center size-8 rounded-full border bg-background ${getActionBorder(action)} `}
        >
          {" "}
          {getActionIcon(action)}{" "}
        </div>{" "}
        {/* Connector */}{" "}
        {!isLast && <div className="w-px flex-1 min-h-8 bg-border" />}{" "}
      </div>{" "}
      {/* Event */}{" "}
      <div className={` flex-1 min-w-0 ${isLast ? "pb-2" : "pb-6"} `}>
        {" "}
        {/* Event card */}{" "}
        <div className="rounded-lg border bg-card overflow-hidden">
          {" "}
          {/* Event header */}{" "}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 p-3 border-b bg-muted/20">
            {" "}
            <div className="min-w-0">
              {" "}
              <div className="flex items-center gap-2 flex-wrap">
                {" "}
                <span className="text-sm font-semibold">
                  {" "}
                  {actionLabel}{" "}
                </span>{" "}
                {value.platform && (
                  <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium">
                    {" "}
                    {value.platform}{" "}
                  </span>
                )}{" "}
                {value.status && <StatusBadge status={value.status} />}{" "}
              </div>{" "}
              {value.topic && (
                <p className="mt-1 text-xs text-muted-foreground truncate">
                  {" "}
                  {value.topic}{" "}
                </p>
              )}{" "}
            </div>{" "}
            {/* Timestamp */}{" "}
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground shrink-0">
              {" "}
              <Clock3 className="size-3" />{" "}
              <span>
                {" "}
                {timestamp
                  ? new Date(timestamp).toLocaleString()
                  : "Unknown time"}{" "}
              </span>{" "}
            </div>{" "}
          </div>{" "}
          {/* Main information */}{" "}
          <div className="p-3 space-y-3">
            {" "}
            {/* User content */}{" "}
            {typeof value.userContent === "string" && value.userContent && (
              <AuditField
                icon={<MessageSquare className="size-3.5" />}
                label="User Input"
                value={value.userContent}
              />
            )}{" "}
            {/* Generated content */}{" "}
            {typeof value.promptContent === "string" && value.promptContent && (
              <AuditField
                icon={<Sparkles className="size-3.5" />}
                label="Generated Content"
                value={value.promptContent}
                preview
              />
            )}{" "}
            {/* Technical details */}{" "}
            {Boolean(value.prompt || log.old_value) && (
              <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className=" flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors "
              >
                {" "}
                {expanded ? (
                  <ChevronDown className="size-3.5" />
                ) : (
                  <ChevronRight className="size-3.5" />
                )}{" "}
                Technical details{" "}
              </button>
            )}{" "}
            {expanded && (
              <div className="space-y-3 pt-1">
                {" "}
                {value.prompt && (
                  <AuditField
                    icon={<FileText className="size-3.5" />}
                    label="Prompt"
                    value={value.prompt}
                  />
                )}{" "}
                {log.old_value && Object.keys(log.old_value).length > 0 && (
                  <div>
                    {" "}
                    <p className="text-[11px] font-medium text-muted-foreground mb-1.5">
                      {" "}
                      Previous Value{" "}
                    </p>{" "}
                    <pre className=" text-[10px] leading-relaxed whitespace-pre-wrap break-words overflow-x-auto rounded-md border bg-muted/30 p-2.5 max-h-60 ">
                      {" "}
                      {JSON.stringify(log.old_value, null, 2)}{" "}
                    </pre>{" "}
                  </div>
                )}{" "}
              </div>
            )}{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
};
/* -------------------------------------------------------------------------- */ /* Audit Field */ /* -------------------------------------------------------------------------- */ interface AuditFieldProps {
  icon?: React.ReactNode;
  label: string;
  value: string;
  preview?: boolean;
}
const AuditField = ({
  icon,
  label,
  value,
  preview = false,
}: AuditFieldProps) => {
  const [expanded, setExpanded] = useState(false);
  const isLong = value.length > 350;
  const displayValue =
    preview && isLong && !expanded ? `${value.slice(0, 350)}…` : value;
  return (
    <div className="min-w-0">
      {" "}
      <div className="flex items-center gap-1.5 mb-1.5">
        {" "}
        {icon && <span className="text-muted-foreground"> {icon} </span>}{" "}
        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
          {" "}
          {label}{" "}
        </span>{" "}
      </div>{" "}
      <div className=" rounded-md border border-border/60 bg-muted/20 p-2.5 text-xs leading-relaxed whitespace-pre-wrap break-words [overflow-wrap:anywhere] ">
        {" "}
        {displayValue}{" "}
      </div>{" "}
      {preview && isLong && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className=" mt-1.5 text-[11px] font-medium text-primary hover:underline "
        >
          {" "}
          {expanded ? "Show less" : "Show more"}{" "}
        </button>
      )}{" "}
    </div>
  );
};
/* -------------------------------------------------------------------------- */ /* Status Badge */ /* -------------------------------------------------------------------------- */ const StatusBadge =
  ({ status }: { status: string }) => {
    const normalized = status.toUpperCase();
    const classes =
      normalized === "POSTED"
        ? "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400"
        : normalized === "DELETED"
          ? "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400"
          : "border-yellow-500/30 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400";
    return (
      <span
        className={` inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${classes} `}
      >
        {" "}
        {normalized}{" "}
      </span>
    );
  };
/* -------------------------------------------------------------------------- */ /* Helpers */ /* -------------------------------------------------------------------------- */ const getAction =
  (log: AuditLog) => {
    if (log.action) {
      return log.action.toUpperCase();
    }
    if (!log.old_value || Object.keys(log.old_value).length === 0) {
      return "CREATE";
    }
    return "UPDATE";
  };
const getActionLabel = (action: string) => {
  switch (action) {
    case "CREATE":
    case "CREATED":
      return "Content Created";
    case "UPDATE":
    case "UPDATED":
      return "Content Updated";
    case "DELETE":
    case "DELETED":
      return "Content Deleted";
    default:
      return action.charAt(0) + action.slice(1).toLowerCase();
  }
};
const getActionBorder = (action: string) => {
  switch (action) {
    case "CREATE":
    case "CREATED":
      return "border-green-500/40";
    case "UPDATE":
    case "UPDATED":
      return "border-blue-500/40";
    case "DELETE":
    case "DELETED":
      return "border-red-500/40";
    default:
      return "border-border";
  }
};
const getActionIcon = (action: string) => {
  switch (action) {
    case "CREATE":
    case "CREATED":
      return <CheckCircle2 className="size-4 text-green-600" />;
    case "UPDATE":
    case "UPDATED":
      return <History className="size-4 text-blue-600" />;
    case "DELETE":
    case "DELETED":
      return <FileText className="size-4 text-red-600" />;
    default:
      return <History className="size-4" />;
  }
};
/* -------------------------------------------------------------------------- */ /* Empty State */ /* -------------------------------------------------------------------------- */ const EmptyAuditState =
  () => {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        {" "}
        <div className="flex items-center justify-center size-12 rounded-full bg-muted mb-3">
          {" "}
          <History className="size-5 text-muted-foreground" />{" "}
        </div>{" "}
        <p className="text-sm font-medium"> No audit history </p>{" "}
        <p className="text-xs text-muted-foreground mt-1">
          {" "}
          Changes to this content will appear here.{" "}
        </p>{" "}
      </div>
    );
  };
export default AuditHistory;