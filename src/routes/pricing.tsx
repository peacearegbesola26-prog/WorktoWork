import { createFileRoute } from "@tanstack/react-router";
import { Pricing } from "@/components/work/public-pages";
import { websiteHead } from "@/features/website/head";
import { publishedWebsiteOptions } from "@/features/website/query";
export const Route = createFileRoute("/pricing")({
  loader: ({ context }) => context.queryClient.ensureQueryData(publishedWebsiteOptions),
  head: ({ loaderData }) => websiteHead(loaderData, "pricing"),
  component: Page,
});
function Page() {
  return <Pricing />;
}
