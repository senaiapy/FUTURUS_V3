"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface RoutePermission {
  access: "lock" | "access";
  mode: "read" | "read_write";
}

export interface PermissionsMap {
  [key: string]: RoutePermission;
}

interface PermissionsContextType {
  permissions: PermissionsMap;
  role: "admin" | "user_admin" | null;
  isAdmin: boolean;
  isLoading: boolean;
  canAccess: (routeKey: string) => boolean;
  canWrite: (routeKey: string) => boolean;
  setPermissions: (permissions: PermissionsMap, role: "admin" | "user_admin") => void;
  clearPermissions: () => void;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

// Default permissions - all locked
export const DEFAULT_PERMISSIONS: PermissionsMap = {
  dashboard: { access: "lock", mode: "read" },
  categories: { access: "lock", mode: "read" },
  subcategories: { access: "lock", mode: "read" },
  markets: { access: "lock", mode: "read" },
  users: { access: "lock", mode: "read" },
  deposits: { access: "lock", mode: "read" },
  withdrawals: { access: "lock", mode: "read" },
  reports: { access: "lock", mode: "read" },
  support: { access: "lock", mode: "read" },
  game: { access: "lock", mode: "read" },
  settings: { access: "lock", mode: "read" },
  grupos: { access: "lock", mode: "read" },
  "futurus-coin": { access: "lock", mode: "read" },
  "ia-control": { access: "lock", mode: "read" },
};

// Admin routes for menu filtering
export const ADMIN_ROUTES = [
  { key: "dashboard", label: "Dashboard", path: "/dashboard" },
  { key: "categories", label: "Categories", path: "/dashboard/categories" },
  { key: "subcategories", label: "Subcategories", path: "/dashboard/subcategories" },
  { key: "markets", label: "Markets", path: "/dashboard/markets" },
  { key: "users", label: "Manage Users", path: "/dashboard/users" },
  { key: "deposits", label: "Deposits", path: "/dashboard/deposits" },
  { key: "withdrawals", label: "Withdrawals", path: "/dashboard/withdrawals" },
  { key: "reports", label: "Reports", path: "/dashboard/reports" },
  { key: "support", label: "Support", path: "/dashboard/support" },
  { key: "game", label: "Game", path: "/dashboard/game" },
  { key: "settings", label: "Settings", path: "/dashboard/settings" },
  { key: "grupos", label: "Grupos", path: "/dashboard/grupos" },
  { key: "futurus-coin", label: "Futurus Coin", path: "/dashboard/futurus-coin" },
  { key: "ia-control", label: "IA Control", path: "/dashboard/ia-control" },
];

export function PermissionsProvider({ children }: { children: ReactNode }) {
  const [permissions, setPermissionsState] = useState<PermissionsMap>(DEFAULT_PERMISSIONS);
  const [role, setRole] = useState<"admin" | "user_admin" | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load permissions from localStorage on mount
  useEffect(() => {
    const storedRole = localStorage.getItem("admin_role") as "admin" | "user_admin" | null;
    const storedPermissions = localStorage.getItem("admin_permissions");

    if (storedRole) {
      setRole(storedRole);
      if (storedRole === "admin") {
        // Super admin has full access - set all permissions to access + read_write
        const fullPermissions: PermissionsMap = {};
        Object.keys(DEFAULT_PERMISSIONS).forEach((key) => {
          fullPermissions[key] = { access: "access", mode: "read_write" };
        });
        setPermissionsState(fullPermissions);
      } else if (storedPermissions) {
        try {
          setPermissionsState(JSON.parse(storedPermissions));
        } catch {
          setPermissionsState(DEFAULT_PERMISSIONS);
        }
      }
    }
    setIsLoading(false);
  }, []);

  const isAdmin = role === "admin";

  const canAccess = (routeKey: string): boolean => {
    // Super admin can access everything
    if (isAdmin) return true;

    // Check if route permission exists and is accessible
    const permission = permissions[routeKey];
    return permission?.access === "access";
  };

  const canWrite = (routeKey: string): boolean => {
    // Super admin can write everywhere
    if (isAdmin) return true;

    // Check if route permission allows writing
    const permission = permissions[routeKey];
    return permission?.access === "access" && permission?.mode === "read_write";
  };

  const setPermissions = (newPermissions: PermissionsMap, newRole: "admin" | "user_admin") => {
    setRole(newRole);
    localStorage.setItem("admin_role", newRole);

    if (newRole === "admin") {
      // Super admin has full access
      const fullPermissions: PermissionsMap = {};
      Object.keys(DEFAULT_PERMISSIONS).forEach((key) => {
        fullPermissions[key] = { access: "access", mode: "read_write" };
      });
      setPermissionsState(fullPermissions);
    } else {
      setPermissionsState(newPermissions);
      localStorage.setItem("admin_permissions", JSON.stringify(newPermissions));
    }
  };

  const clearPermissions = () => {
    setPermissionsState(DEFAULT_PERMISSIONS);
    setRole(null);
    localStorage.removeItem("admin_role");
    localStorage.removeItem("admin_permissions");
  };

  return (
    <PermissionsContext.Provider
      value={{
        permissions,
        role,
        isAdmin,
        isLoading,
        canAccess,
        canWrite,
        setPermissions,
        clearPermissions,
      }}
    >
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions() {
  const context = useContext(PermissionsContext);
  if (context === undefined) {
    throw new Error("usePermissions must be used within a PermissionsProvider");
  }
  return context;
}

// Helper function to extract route key from pathname
export function getRouteKeyFromPath(pathname: string): string {
  // Remove /dashboard prefix and get first segment
  const cleanPath = pathname.replace(/^\/dashboard\/?/, "");
  const segments = cleanPath.split("/").filter((s) => s && !s.match(/^\d+$/));

  // Map common path segments to route keys
  const pathToRouteMap: Record<string, string> = {
    "": "dashboard",
    categories: "categories",
    subcategories: "subcategories",
    markets: "markets",
    users: "users",
    deposits: "deposits",
    withdrawals: "withdrawals",
    reports: "reports",
    support: "support",
    game: "game",
    settings: "settings",
    grupos: "grupos",
    "futurus-coin": "futurus-coin",
    "ia-control": "ia-control",
    permissions: "permissions", // Admin only
  };

  const firstSegment = segments[0] || "";
  return pathToRouteMap[firstSegment] || "dashboard";
}
