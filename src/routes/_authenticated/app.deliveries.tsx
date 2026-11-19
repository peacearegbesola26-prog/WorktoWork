import { createFileRoute } from "@tanstack/react-router";
import { ContractsPage } from "@/features/marketplace/workflow-page";
import { marketplaceOptions } from "@/features/marketplace/workflow-query";
import { pageHead } from "@/lib/page-head";
export const Route = createFileRoute("/_authenticated/app/deliveries")({
  loader: async ({ context }) => { await context.queryClient.ensureQueryData(marketplaceOptions); },
  head: () => pageHead("Deliveries", "Work submission and approval status for Work to Work contracts."),
  component: () => <ContractsPage deliveries />,
});