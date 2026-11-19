import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { ContractsPage } from "@/features/marketplace/workflow-page";
import { marketplaceOptions } from "@/features/marketplace/workflow-query";
import { pageHead } from "@/lib/page-head";
export const Route = createFileRoute("/_authenticated/app/contracts")({
  validateSearch: v => z.object({ conversation: z.string().uuid().optional() }).parse(v),
  loader: async ({ context }) => { await context.queryClient.ensureQueryData(marketplaceOptions); },
  head: () => pageHead("Contracts and milestones", "Review project offers and unfunded milestones on Work to Work."),
  component: () => <ContractsPage initialConversation={Route.useSearch().conversation ?? ""} />,
});