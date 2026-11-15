import { createFileRoute } from "@tanstack/react-router";
import { AdminPage } from "@/features/admin/admin-page";
import { adminOptions } from "@/features/admin/query";
import { pageHead } from "@/lib/page-head";
export const Route = createFileRoute("/_authenticated/admin/audit")({
  head: () =>
    pageHead("Administrator audit trail", "Protected history of Work to Work opportunity changes."),
  loader: ({ context }) => context.queryClient.ensureQueryData(adminOptions),
  component: () => <AdminPage view="audit" />,
});
