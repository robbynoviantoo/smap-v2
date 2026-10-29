"use client";
import { useAuth } from "@/hooks/api/useAuth";

export function useSouvenirAccess() {
  const { user } = useAuth();
  const roles = user?.roles?.map(({ name }) => name.toLowerCase()) || [];
  return {
    canManage: roles.includes("admin-souvenir") || roles.includes("superadmin"),
    canDelete: roles.includes("superadmin"),
  };
}
