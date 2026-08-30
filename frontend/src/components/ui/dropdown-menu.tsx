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
  asChild?: boolean;
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

type DropdownMenuContextValue = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  triggerRef: React.RefObject<HTMLElement | null>;
};

const DropdownMenuContext = React.createContext<DropdownMenuContextValue | null>(null);

const DropdownMenu = ({ children }: DropdownMenuProps) => {
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLElement | null>(null);
  const value = React.useMemo(() => ({ open, setOpen, triggerRef }), [open]);
  return (
    <DropdownMenuContext.Provider value={value}>
      <div className="relative inline-flex">{children}</div>
    </DropdownMenuContext.Provider>
  );
};

const DropdownMenuTrigger = React.forwardRef<HTMLElement, DropdownMenuTriggerProps>(
  ({ children, className, asChild, ...props }, forwardedRef) => {
    const ctx = React.useContext(DropdownMenuContext);
    if (!ctx) throw new Error("DropdownMenuTrigger must be used within DropdownMenu");

    const handleClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      ctx.setOpen((v) => !v);
      // call child's onClick if exists
      const child = children as React.ReactElement<{ onClick?: (e: React.MouseEvent) => void }>;
      child?.props?.onClick?.(e);
    };

    const setRef = React.useCallback(
      (node: HTMLElement | null) => {
        (ctx.triggerRef as React.MutableRefObject<HTMLElement | null>).current = node;
        if (typeof forwardedRef === "function") forwardedRef(node as unknown as HTMLElement);
        else if (forwardedRef) (forwardedRef as React.MutableRefObject<HTMLElement | null>).current = node;
      },
      [ctx.triggerRef, forwardedRef]
    );

    if (asChild && React.isValidElement(children)) {
      const child = children as React.ReactElement<Record<string, unknown>>;
      return React.cloneElement(child as React.ReactElement<{ ref?: React.Ref<HTMLElement>; onClick?: (e: React.MouseEvent) => void; className?: string }>, {
        ref: setRef,
        onClick: handleClick,
      } as unknown as Record<string, unknown>);
    }

    return (
      <button
        ref={setRef as React.Ref<HTMLButtonElement>}
        data-state={ctx.open ? "open" : "closed"}
        aria-haspopup="menu"
        aria-expanded={ctx.open}
        onClick={handleClick}
        className={cn(
          "group inline-flex items-center justify-center gap-1.5 rounded-none border border-transparent bg-clip-padding text-xs font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 h-8 px-2.5",
          className
        )}
        {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {children}
      </button>
    );
  }
);
DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

const DropdownMenuContent = React.forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  ({ children, className, align = "start", side = "bottom", sideOffset = 4, ...props }, ref) => {
    const ctx = React.useContext(DropdownMenuContext);
    const [mounted, setMounted] = React.useState(false);
    const innerRef = React.useRef<HTMLDivElement | null>(null);
    const [style, setStyle] = React.useState<React.CSSProperties>({});

    const setRefs = React.useCallback(
      (node: HTMLDivElement | null) => {
        (innerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      },
      [ref]
    );

    React.useEffect(() => setMounted(true), []);

    const updatePosition = React.useCallback(() => {
      const trigger = ctx?.triggerRef.current;
      const content = innerRef.current;
      if (!trigger || !content || !ctx?.open) return;

      const rect = trigger.getBoundingClientRect();
      const contentRect = content.getBoundingClientRect();
      const viewportW = window.innerWidth;
      const viewportH = window.innerHeight;

      let top: number | undefined;
      let left: number | undefined;
      let right: number | undefined;
      let bottom: number | undefined;

      if (side === "bottom") {
        top = rect.bottom + sideOffset;
        if (align === "end") {
          right = viewportW - rect.right;
          left = undefined;
        } else if (align === "start") {
          left = rect.left;
          right = undefined;
        } else {
          // center
          left = rect.left + rect.width / 2 - contentRect.width / 2;
          // clamp
          left = Math.max(8, Math.min(left, viewportW - contentRect.width - 8));
        }
        // if overflow bottom, flip to top
        if (top + contentRect.height > viewportH - 8) {
          top = rect.top - contentRect.height - sideOffset;
        }
      } else if (side === "top") {
        bottom = viewportH - rect.top + sideOffset;
        if (align === "end") {
          right = viewportW - rect.right;
        } else if (align === "start") {
          left = rect.left;
        } else {
          left = rect.left + rect.width / 2 - contentRect.width / 2;
          left = Math.max(8, Math.min(left, viewportW - contentRect.width - 8));
        }
        top = undefined;
      } else if (side === "right") {
        left = rect.right + sideOffset;
        top = rect.top;
      } else if (side === "left") {
        right = viewportW - rect.left + sideOffset;
        top = rect.top;
      }

      const next: React.CSSProperties = {
        position: "fixed",
        zIndex: 100,
        top: top !== undefined ? `${top}px` : undefined,
        left: left !== undefined ? `${left}px` : undefined,
        right: right !== undefined ? `${right}px` : undefined,
        bottom: bottom !== undefined ? `${bottom}px` : undefined,
      };
      setStyle(next);
    }, [ctx?.open, ctx?.triggerRef, align, side, sideOffset]);

    React.useLayoutEffect(() => {
      if (ctx?.open) {
        // delay one frame so content is measured
        const id = requestAnimationFrame(() => updatePosition());
        return () => cancelAnimationFrame(id);
      }
    }, [ctx?.open, updatePosition]);

    React.useEffect(() => {
      if (!ctx?.open) return;
      const handleClickOutside = (e: MouseEvent) => {
        const target = e.target as Node;
        if (innerRef.current?.contains(target)) return;
        if (ctx.triggerRef.current?.contains(target)) return;
        ctx.setOpen(false);
      };
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === "Escape") ctx.setOpen(false);
      };
      const handleReposition = () => updatePosition();
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEsc);
      window.addEventListener("resize", handleReposition);
      window.addEventListener("scroll", handleReposition, true);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleEsc);
        window.removeEventListener("resize", handleReposition);
        window.removeEventListener("scroll", handleReposition, true);
      };
    }, [ctx, updatePosition]);

    if (!mounted || !ctx?.open) return null;

    const content = (
      <div
        ref={setRefs}
        data-align={align}
        data-side={side}
        role="menu"
        style={style}
        onClick={() => {
          // close on item click - let item handle but also close after short delay
          // items call stopPropagation individually; we close here if any click inside
          // keep open for now, item will trigger close via context if needed
        }}
        className={cn(
          "z-[100] min-w-[12rem] overflow-hidden rounded-none border border-border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className
        )}
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
  ({ children, onClick, className, disabled, inset, shortcut, ...props }, ref) => {
    const ctx = React.useContext(DropdownMenuContext);
    return (
      <div
        ref={ref}
        role="menuitem"
        data-disabled={disabled}
        data-inset={inset}
        onClick={() => {
          if (disabled) return;
          onClick?.();
          ctx?.setOpen(false);
        }}
        className={cn(
          "relative flex cursor-pointer items-center gap-2 rounded-none px-2 py-1.5 text-xs outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg:not([class*='size-'])]:size-4 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
          className
        )}
        {...props}
      >
        {children}
        {shortcut && <span className="ml-auto text-xs tracking-widest text-muted-foreground">{shortcut}</span>}
      </div>
    );
  }
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
