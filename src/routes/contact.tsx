import { createFileRoute } from "@tanstack/react-router";
import { Contact } from "@/components/work/public-pages";
import { websiteHead } from "@/features/website/head";
import { publishedWebsiteOptions } from "@/features/website/query";
export const Route = createFileRoute("/contact")({
  loader: ({ context }) => context.queryClient.ensureQueryData(publishedWebsiteOptions),
  head: ({ loaderData }) => websiteHead(loaderData, "contact"),
  component: Page,
});
function Page() {
  return <Contact />;
}
