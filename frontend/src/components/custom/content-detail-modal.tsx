import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, History } from "lucide-react";

const statusVariant: Record<
  string,
  "default" | "secondary" | "destructive"
> = {
  POSTED: "default",
  DRAFT: "secondary",
  DELETED: "destructive",
};

interface ContentDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  content: {
    id: string;
    topic: string | null;
    content: string;
    platform: string | null;
    status: "DRAFT" | "POSTED" | "DELETED";
    createdAt: string;
    updatedAt: string;
  } | null;

  onEdit: (id: string) => void;
  onAudit: (id: string) => void;
}

export function ContentDetailModal({
  open,
  onOpenChange,
  content,
  onEdit,
  onAudit,
}: ContentDetailModalProps) {
  if (!content) return null;

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Content Details"
      size="lg"
      className="
        w-[calc(100vw-2rem)]
        sm:w-full
        max-w-160
        max-h-[85vh]
        flex
        flex-col
        overflow-hidden
      "
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-4 shrink-0 pb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary">
            {content.platform || "Unassigned"}
          </Badge>

          <Badge
            variant={statusVariant[content.status] ?? "secondary"}
          >
            {content.status}
          </Badge>
        </div>

        <span className="text-xs text-muted-foreground whitespace-nowrap">
          Created {new Date(content.createdAt).toLocaleString()}
        </span>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden space-y-4 pr-2 min-w-0">
        {/* Topic */}
        {content.topic && (
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
              Topic
            </p>

            <p className="text-sm font-medium break-words [overflow-wrap:anywhere] min-w-0">
              {content.topic}
            </p>
          </div>
        )}

        {/* Content */}
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
            Content
          </p>

          <div
            className="
              w-full
              max-w-full
              min-w-0
              text-sm
              leading-relaxed
              whitespace-pre-wrap
              break-words
              [overflow-wrap:anywhere]
              overflow-hidden
              border
              border-border/50
              rounded-md
              p-3
              bg-muted/20
            "
          >
            {content.content}
          </div>
        </div>

        {/* Last updated */}
        <p className="text-[11px] text-muted-foreground">
          Last updated {new Date(content.updatedAt).toLocaleString()}
        </p>
      </div>

      {/* Footer */}
      <div
        className="
          flex
          flex-wrap
          justify-end
          gap-2
          pt-3
          mt-3
          border-t
          border-border
          shrink-0
        "
      >
        <Button
          variant="outline"
          onClick={() => onAudit(content.id)}
        >
          <History className="size-4 mr-2" />
          View Audit
        </Button>

        <Button onClick={() => onEdit(content.id)}>
          <Edit className="size-4 mr-2" />
          Edit
        </Button>
      </div>
    </Modal>
  );
}