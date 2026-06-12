import type { PortalUserRole } from "@/lib/user/portal-user-types";

export type MenuItem = {
  label: string;
  href?: string;
  children?: MenuItem[];
  /** Subitens sob um rótulo de grupo (sem link no rótulo). */
  groupItems?: MenuItem[];
  /** Restringe visibilidade do item a perfis específicos do portal. */
  requiredRoles?: PortalUserRole[];
};

export type MenuSection = {
  id: string;
  label: string;
  items: MenuItem[];
};
