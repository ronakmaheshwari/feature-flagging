"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: {
    value: number;
    label: string;
  };
  icon?: React.ReactNode;
  iconClassName?: string;
  className?: string;
  variant?: "default" | "primary" | "success" | "warning" | "destructive";
}

export function StatCard({
  title,
  value,
  description,
  trend,
  icon,
  iconClassName,
  className,
  variant = "default",
}: StatCardProps) {
  const variantClasses = {
    default: "border-border",
    primary: "border-primary/20",
    success: "border-green-500/20",
    warning: "border-yellow-500/20",
    destructive: "border-red-500/20",
  };

  const trendIcon = trend
    ? trend.value > 0
      ? <TrendingUp className="size-3.5 text-green-600 dark:text-green-400" />
      : trend.value < 0
      ? <TrendingDown className="size-3.5 text-red-600 dark:text-red-400" />
      : <Minus className="size-3.5 text-muted-foreground" />
    : null;

  return (
    <Card className={cn(variantClasses[variant], className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground">{title}</CardTitle>
        {icon && <div className={cn("text-muted-foreground", iconClassName)}>{icon}</div>}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
        {trend && (
          <div className="flex items-center gap-1 mt-2 text-xs">
            {trendIcon}
            <span className={cn(trend.value > 0 ? "text-green-600" : trend.value < 0 ? "text-red-600" : "text-muted-foreground")}>
              {trend.value > 0 ? "+" : ""}{trend.value}% {trend.label}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}