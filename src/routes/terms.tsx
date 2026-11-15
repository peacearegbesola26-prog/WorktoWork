import { createFileRoute } from "@tanstack/react-router";
import { ManagedPublicPage } from "@/features/website/managed-page";
import { publishedWebsiteOptions } from "@/features/website/query";
import { websiteHead } from "@/features/website/head";
export const Route = createFileRoute("/terms")({
  loader: ({ context }) => context.queryClient.ensureQueryData(publishedWebsiteOptions),
  head: ({ loaderData }) => websiteHead(loaderData, "terms"),
  component: () => <ManagedPublicPage page="terms" />,
});
