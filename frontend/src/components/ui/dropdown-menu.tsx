"use client";

import * as React from "react";
import { ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { createPortal } from "react-dom";

interface DropdownMenuProps {
  children: React.ReactNode;
}

interface DropdownMenuTriggerProps {
  children: React.ReactNode;
  className?: string;
}

interface DropdownMenuContentProps {
  children: React.ReactNode;
  className?: string;
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
}

interface DropdownMenuItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  inset?: boolean;
  shortcut?: string;
}

interface DropdownMenuSeparatorProps {
  className?: string;
}

interface DropdownMenuLabelProps {
  children: React.ReactNode;
  className?: string;
  inset?: boolean;
}

interface DropdownMenuGroupProps {
  children: React.ReactNode;
}

interface DropdownMenuSubContentProps {
  children: React.ReactNode;
  className?: string;
}

interface DropdownMenuSubTriggerProps {
  children: React.ReactNode;
  className?: string;
  inset?: boolean;
}

const DropdownMenu = ({ children }: DropdownMenuProps) => <>{children}</>;

const DropdownMenuTrigger = React.forwardRef<HTMLButtonElement, DropdownMenuTriggerProps>(
  ({ children, className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "group inline-flex items-center justify-center gap-1.5 rounded-none border border-transparent bg-clip-padding text-xs font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 h-8 px-2.5",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
);
DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

const DropdownMenuContent = React.forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  ({ children, className, align = "start", side = "bottom", sideOffset = 4, ...props }, ref) => {
    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => setMounted(true), []);

    if (!mounted) return null;

    const content = (
      <div
        ref={ref}
        data-align={align}
        data-side={side}
        className={cn(
          "z-50 min-w-[12rem] overflow-hidden rounded-none border border-border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className
        )}
        style={{ position: "absolute" }}
        {...props}
      >
        {children}
      </div>
    );

    return createPortal(content, document.body);
  }
);
DropdownMenuContent.displayName = "DropdownMenuContent";

const DropdownMenuItem = React.forwardRef<HTMLDivElement, DropdownMenuItemProps>(
  ({ children, onClick, className, disabled, inset, shortcut, ...props }, ref) => (
    <div
      ref={ref}
      data-disabled={disabled}
      data-inset={inset}
      onClick={onClick}
      className={cn(
        "relative flex cursor-default items-center gap-2 rounded-none px-2 py-1.5 text-xs outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg:not([class*='size-'])]:size-4 hover:bg-accent hover:text-accent-foreground",
        className
      )}
      {...props}
    >
      {children}
      {shortcut && <span className="ml-auto text-xs tracking-widest text-muted-foreground">{shortcut}</span>}
    </div>
  )
);
DropdownMenuItem.displayName = "DropdownMenuItem";

const DropdownMenuSeparator = React.forwardRef<HTMLDivElement, DropdownMenuSeparatorProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("h-px bg-border -mx-1 my-1", className)}
      {...props}
    />
  )
);
DropdownMenuSeparator.displayName = "DropdownMenuSeparator";

const DropdownMenuLabel = React.forwardRef<HTMLDivElement, DropdownMenuLabelProps>(
  ({ children, className, inset, ...props }, ref) => (
    <div
      ref={ref}
      data-inset={inset}
      className={cn("px-2 py-1.5 text-xs font-semibold text-muted-foreground data-[inset]:pl-8", className)}
      {...props}
    >
      {children}
    </div>
  )
);
DropdownMenuLabel.displayName = "DropdownMenuLabel";

const DropdownMenuGroup = React.forwardRef<HTMLDivElement, DropdownMenuGroupProps>(
  ({ children, ...props }, ref) => (
    <div ref={ref} {...props}>{children}</div>
  )
);
DropdownMenuGroup.displayName = "DropdownMenuGroup";

const DropdownMenuSub = ({ children }: { children: React.ReactNode }) => <>{children}</>;

const DropdownMenuSubTrigger = React.forwardRef<HTMLDivElement, DropdownMenuSubTriggerProps>(
  ({ children, className, inset, ...props }, ref) => (
    <div
      ref={ref}
      data-inset={inset}
      className={cn(
        "flex cursor-default items-center gap-2 rounded-none px-2 py-1.5 text-xs outline-none select-none data-[inset]:pl-8 hover:bg-accent hover:text-accent-foreground [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <ChevronRight className="ml-auto size-3.5 text-muted-foreground" />
    </div>
  )
);
DropdownMenuSubTrigger.displayName = "DropdownMenuSubTrigger";

const DropdownMenuSubContent = React.forwardRef<HTMLDivElement, DropdownMenuSubContentProps>(
  ({ children, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "z-50 min-w-[12rem] overflow-hidden rounded-none border border-border bg-popover p-1 text-popover-foreground shadow-md",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
DropdownMenuSubContent.displayName = "DropdownMenuSubContent";

const DropdownMenuCheckboxItem = React.forwardRef<HTMLDivElement, DropdownMenuItemProps & { checked?: boolean }>(
  ({ children, className, checked, ...props }, ref) => (
    <div
      ref={ref}
      data-checked={checked}
      className={cn(
        "relative flex cursor-default items-center gap-2 rounded-none px-2 py-1.5 text-xs outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-accent hover:text-accent-foreground [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <span className="absolute left-2 flex size-3.5 items-center justify-center">
        {checked && <Check className="size-3.5" />}
      </span>
      <span className="pl-7">{children}</span>
    </div>
  )
);
DropdownMenuCheckboxItem.displayName = "DropdownMenuCheckboxItem";

const DropdownMenuRadioGroup = ({ children }: { children: React.ReactNode }) => <>{children}</>;

const DropdownMenuRadioItem = React.forwardRef<HTMLDivElement, DropdownMenuItemProps & { checked?: boolean; value: string }>(
  ({ children, className, checked, value, ...props }, ref) => (
    <div
      ref={ref}
      data-checked={checked}
      data-value={value}
      className={cn(
        "relative flex cursor-default items-center gap-2 rounded-none px-2 py-1.5 text-xs outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-accent hover:text-accent-foreground [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <span className="absolute left-2 flex size-3.5 items-center justify-center">
        {checked && <Check className="size-3.5" />}
      </span>
      <span className="pl-7">{children}</span>
    </div>
  )
);
DropdownMenuRadioItem.displayName = "DropdownMenuRadioItem";

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
};