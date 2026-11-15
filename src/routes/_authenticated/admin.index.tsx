import { createFileRoute } from "@tanstack/react-router";
import { AdminPage } from "@/features/admin/admin-page";
import { adminOptions } from "@/features/admin/query";
import { pageHead } from "@/lib/page-head";
export const Route = createFileRoute("/_authenticated/admin/")({
  head: () =>
    pageHead("Administration overview", "Real Work to Work account and opportunity totals."),
  loader: ({ context }) => context.queryClient.ensureQueryData(adminOptions),
  component: () => <AdminPage view="overview" />,
});
