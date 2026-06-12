export const PORTAL_USER_ROLES = ["admin-master", "admin-cliente", "operador", "fornecedor"] as const;

export type PortalUserRole = (typeof PORTAL_USER_ROLES)[number];

export type PortalUser = {
  name: string;
  email: string;
  role: PortalUserRole;
};

export const PORTAL_ADMIN_ROLES: PortalUserRole[] = ["admin-master", "admin-cliente"];
