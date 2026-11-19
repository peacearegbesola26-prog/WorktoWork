import { createFileRoute } from "@tanstack/react-router";
import { NotificationsPage } from "@/features/marketplace/workflow-page";
import { marketplaceOptions } from "@/features/marketplace/workflow-query";
import { pageHead } from "@/lib/page-head";
export const Route = createFileRoute("/_authenticated/app/notifications")({
  loader: async ({ context }) => { await context.queryClient.ensureQueryData(marketplaceOptions); },
  head: () => pageHead("Notifications", "Your private message and offer updates on Work to Work."),
  component: NotificationsPage,
});