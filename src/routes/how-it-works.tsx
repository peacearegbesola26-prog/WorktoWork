import { createFileRoute } from "@tanstack/react-router";
import { HowItWorks } from "@/components/work/public-pages";
import { websiteHead } from "@/features/website/head";
import { publishedWebsiteOptions } from "@/features/website/query";
export const Route = createFileRoute("/how-it-works")({
  loader: ({ context }) => context.queryClient.ensureQueryData(publishedWebsiteOptions),
  head: ({ loaderData }) => websiteHead(loaderData, "public"),
  component: Page,
});
function Page() {
  return <HowItWorks />;
}
