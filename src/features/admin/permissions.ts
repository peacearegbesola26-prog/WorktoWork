export type StaffPermission =
  | "admin.access"
  | "opportunities.manage"
  | "sources.manage"
  | "audit.read"
  | "ai.manage"
  | "users.manage"
  | "roles.manage";
export type WebsitePermission = "content.manage" | "site.manage";
export function permissionForAdminPath(path: string): StaffPermission | WebsitePermission {
  if (path.startsWith("/admin/content")) return "content.manage";
  if (path.startsWith("/admin/site-settings")) return "site.manage";
  if (path.startsWith("/admin/opportunities")) return "opportunities.manage";
  if (path.startsWith("/admin/sources")) return "sources.manage";
  if (path.startsWith("/admin/audit")) return "audit.read";
  if (path.startsWith("/admin/access")) return "ai.manage";
  if (path.startsWith("/admin/users")) return "users.manage";
  return "admin.access";
}
