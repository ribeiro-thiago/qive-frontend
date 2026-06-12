"use client";

import * as React from "react";
import type { PortalUser, PortalUserRole } from "./portal-user-types";

const MOCK_PORTAL_USER: PortalUser = {
  name: "Maria Oliveira",
  email: "maria.oliveira@empresa.com",
  role: "admin-master",
};

type PortalUserContextValue = {
  user: PortalUser;
  hasRole: (roles: PortalUserRole | PortalUserRole[]) => boolean;
};

const PortalUserContext = React.createContext<PortalUserContextValue | null>(null);

export function PortalUserProvider({ children }: { children: React.ReactNode }) {
  const user = MOCK_PORTAL_USER;

  const hasRole = React.useCallback(
    (roles: PortalUserRole | PortalUserRole[]) => {
      const allowed = Array.isArray(roles) ? roles : [roles];
      return allowed.includes(user.role);
    },
    [user.role],
  );

  const value = React.useMemo(() => ({ user, hasRole }), [user, hasRole]);

  return <PortalUserContext.Provider value={value}>{children}</PortalUserContext.Provider>;
}

export function usePortalUser(): PortalUserContextValue {
  const context = React.useContext(PortalUserContext);
  if (!context) {
    throw new Error("usePortalUser must be used within PortalUserProvider");
  }
  return context;
}
