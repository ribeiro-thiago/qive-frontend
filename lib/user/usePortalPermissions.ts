"use client";

import { PORTAL_ADMIN_ROLES } from "./portal-user-types";
import { usePortalUser } from "./PortalUserContext";

export function usePortalPermissions() {
  const { hasRole } = usePortalUser();

  return {
    canViewActivityHistory: hasRole(PORTAL_ADMIN_ROLES),
  };
}
