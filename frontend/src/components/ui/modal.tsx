"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { createPortal } from "react-dom";

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  className?: string;
}

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  full: "max-w-4xl",
};

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = "md",
}: ModalProps) {
  if (!open) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onOpenChange(false);
    }
  };

  const content = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onKeyDown={handleKeyDown}
    >
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in-0" onClick={() => onOpenChange(false)} />
      <div
        className={cn(
          "relative w-full border border-border bg-background p-6 shadow-lg animate-in fade-in-0 zoom-in-95 slide-in-from-top-4",
          sizeClasses[size]
        )}
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-lg font-semibold">{title}</h2>
              {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-7 w-7 shrink-0"
              aria-label="Close"
            >
              <X className="size-4" />
            </Button>
          </div>
          <div className="mt-2">{children}</div>
          {footer && (
            <div className="flex justify-end gap-2 pt-4 border-t border-border mt-4">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}

interface ConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
  onConfirm: () => void;
  loading?: boolean;
}

export function ConfirmModal({
  open,
  onOpenChange,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  onConfirm,
  loading = false,
}: ConfirmModalProps) {
  return (
    <Modal open={open} onOpenChange={onOpenChange} title={title} size="sm">
      <p className="text-sm text-muted-foreground">{message}</p>
      <div className="flex justify-end gap-2 pt-4" slot="footer">
        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
          {cancelText}
        </Button>
        <Button variant={variant} onClick={onConfirm} disabled={loading}>
          {loading ? "Processing..." : confirmText}
        </Button>
      </div>
    </Modal>
  );
}

interface FormModalProps<T> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  defaultValues?: Partial<T>;
  onSubmit: (values: T) => Promise<void>;
  children: (form: {
    register: (name: keyof T) => React.InputHTMLAttributes<HTMLInputElement>;
    setValue: (name: keyof T, value: unknown) => void;
    watch: (name: keyof T) => unknown;
    formState: { errors: Record<string, { message: string }>; isSubmitting: boolean };
  }) => React.ReactNode;
  submitText?: string;
  cancelText?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export function FormModal<T extends Record<string, unknown>>({
  open,
  onOpenChange,
  title,
  description,
  children,
  submitText = "Save",
  cancelText = "Cancel",
  size = "md",
}: FormModalProps<T>) {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      size={size}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {cancelText}
          </Button>
          <Button type="submit" form="modal-form">
            {submitText}
          </Button>
        </div>
      }
    >
      <form id="modal-form" onSubmit={(e) => e.preventDefault()}>
        {children({
          register: () => ({}),
          setValue: () => {},
          watch: () => {},
          formState: { errors: {}, isSubmitting: false },
        })}
      </form>
    </Modal>
  );
}