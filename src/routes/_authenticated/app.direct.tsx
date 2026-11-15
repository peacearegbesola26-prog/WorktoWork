import { createFileRoute } from "@tanstack/react-router";
import { DiscoveryPage } from "@/features/discovery/discovery-page";
import { pageHead } from "@/lib/page-head";
export const Route = createFileRoute("/_authenticated/app/direct")({
  head: () => pageHead("Direct opportunities", "Opportunities submitted directly to Work to Work."),
  component: () => <DiscoveryPage section="direct" />,
});
