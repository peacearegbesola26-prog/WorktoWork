import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { MessagesPage } from "@/features/marketplace/workflow-page";
import { marketplaceOptions } from "@/features/marketplace/workflow-query";
import { pageHead } from "@/lib/page-head";
export const Route = createFileRoute("/_authenticated/app/messages")({
  validateSearch: v => z.object({ conversation: z.string().uuid().optional() }).parse(v),
  loader: async ({ context }) => { await context.queryClient.ensureQueryData(marketplaceOptions); },
  head: () => pageHead("Messages", "Private buyer and seller project conversations on Work to Work."),
  component: () => <MessagesPage initialConversation={Route.useSearch().conversation ?? ""} />,
});