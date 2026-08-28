"use client";

import * as React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/components/custom/authContext";
import { Spinner } from "@/components/ui/spinner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ("USER" | "ADMIN")[];
  fallbackPath?: string;
}

export function ProtectedRoute({
  children,
  allowedRoles = ["USER", "ADMIN"],
  fallbackPath = "/signin",
}: ProtectedRouteProps) {
  const { token, role, isLoading, fetchUser } = useAuth();
  const location = useLocation();

  React.useEffect(() => {
    if (token && !role) {
      fetchUser();
    }
  }, [token, role, fetchUser]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (!token) {
    return <Navigate to={fallbackPath} replace state={{ from: location }} />;
  }

  if (role && !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

export function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

export function RoleRoute({
  children,
  role: requiredRole,
}: {
  children: React.ReactNode;
  role: "USER" | "ADMIN";
}) {
  const { role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}