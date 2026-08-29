import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, History, Trash2 } from "lucide-react";

interface ContentCardProps {
  content: {
    id: string;
    topic: string | null;
    content: string;
    platform: string | null;
    status: "DRAFT" | "POSTED" | "DELETED";
    createdAt: string;
    updatedAt: string;
  };
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onAudit: (id: string) => void;
  onDelete: (id: string) => void;
  className?: string;
}

const statusVariant: Record<string, "default" | "secondary" | "destructive"> = {
  POSTED: "default",
  DRAFT: "secondary",
  DELETED: "destructive",
};

export function ContentCard({ content, onView, onEdit, onAudit, onDelete, className }: ContentCardProps) {
  const initials = (content.platform || "?").slice(0, 2).toUpperCase();

  const stop = (fn: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    fn();
  };

  return (
    <div
      onClick={() => onView(content.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onView(content.id); }}
      className={cn(
        "border border-border rounded-none bg-background transition-colors hover:border-foreground/20 cursor-pointer",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        className
      )}
    >
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-[10px] font-medium text-primary">{initials}</span>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-medium">{content.platform || "Unassigned"}</span>
            <span className="text-[11px] text-muted-foreground">
              {new Date(content.createdAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
        <Badge variant={statusVariant[content.status] ?? "secondary"}>{content.status}</Badge>
      </div>

      <div className="px-4 pb-3">
        {content.topic && (
          <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">
            {content.topic}
          </p>
        )}
        <p className="text-sm leading-relaxed whitespace-pre-wrap line-clamp-4">
          {content.content}
        </p>
      </div>

      <div className="flex items-center justify-between px-4 py-2 border-t border-border/50">
        <span className="text-[11px] text-muted-foreground">
          Updated {new Date(content.updatedAt).toLocaleDateString()}
        </span>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={stop(() => onAudit(content.id))} className="h-7 w-7" aria-label="View audit history">
            <History className="size-3.5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={stop(() => onEdit(content.id))} className="h-7 w-7" aria-label="Edit content">
            <Edit className="size-3.5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={stop(() => onDelete(content.id))} className="h-7 w-7 text-destructive" aria-label="Delete content">
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}