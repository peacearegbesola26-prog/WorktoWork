import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { checkStaffPermission } from "@/features/admin/admin.functions";
import { permissionForAdminPath } from "@/features/admin/permissions";
import { StaffShell, StaffAccessDenied } from "@/features/admin/shell";
export const Route = createFileRoute("/admin")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/admin/login", replace: true });
    const allowed = await checkStaffPermission({
      data: { permission: permissionForAdminPath(location.pathname) },
    }).catch(() => false);
    if (!allowed) throw new Error("Access denied.");
  },
  errorComponent: StaffAccessDenied,
  component: () => (
    <StaffShell>
      <Outlet />
    </StaffShell>
  ),
});
