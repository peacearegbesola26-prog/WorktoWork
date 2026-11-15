import { createFileRoute } from "@tanstack/react-router";
import { ManagedPublicPage } from "@/features/website/managed-page";
import { publishedWebsiteOptions } from "@/features/website/query";
import { websiteHead } from "@/features/website/head";
export const Route = createFileRoute("/faqs")({
  loader: ({ context }) => context.queryClient.ensureQueryData(publishedWebsiteOptions),
  head: ({ loaderData }) => websiteHead(loaderData, "faqs"),
  component: () => <ManagedPublicPage page="faqs" />,
});
