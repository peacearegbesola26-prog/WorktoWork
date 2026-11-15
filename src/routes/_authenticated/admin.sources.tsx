import { createFileRoute } from "@tanstack/react-router";
import { AdminPage } from "@/features/admin/admin-page";
import { adminOptions } from "@/features/admin/query";
import { pageHead } from "@/lib/page-head";
export const Route = createFileRoute("/_authenticated/admin/sources")({
  head: () => pageHead("Manage sources", "Work to Work sources and truthful integration states."),
  loader: ({ context }) => context.queryClient.ensureQueryData(adminOptions),
  component: () => <AdminPage view="sources" />,
});
