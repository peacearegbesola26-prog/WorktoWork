import { createFileRoute } from "@tanstack/react-router";
import { Landing } from "@/components/work/landing";
import { websiteHead } from "@/features/website/head";
import { publishedWebsiteOptions } from "@/features/website/query";
export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(publishedWebsiteOptions),
  head: ({ loaderData }) => websiteHead(loaderData, "home"),
  component: Landing,
});
