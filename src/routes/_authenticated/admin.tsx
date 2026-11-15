import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { adminAccess } from "@/features/admin/admin.functions";
export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async () => {
    if (!(await adminAccess())) throw redirect({ to: "/app/dashboard", replace: true });
  },
  component: Outlet,
});
