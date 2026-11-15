import { createFileRoute } from "@tanstack/react-router";
import { AdminPage } from "@/features/admin/admin-page";
import { adminOptions } from "@/features/admin/query";
import { pageHead } from "@/lib/page-head";
export const Route = createFileRoute("/admin/opportunities")({
  head: () =>
    pageHead("Manage opportunities", "Create and manage real Work to Work opportunities."),
  loader: ({ context }) => context.queryClient.ensureQueryData(adminOptions),
  component: () => <AdminPage view="opportunities" />,
});
