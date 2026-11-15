import { createFileRoute } from "@tanstack/react-router";
import { Pricing } from "@/components/work/public-pages";
import { pageHead } from "@/lib/page-head";
export const Route = createFileRoute("/pricing")({
  head: () => pageHead("Planned Pricing", "Explore the planned Work to Work subscriptions."),
  component: Page,
});
function Page() {
  return <Pricing />;
}
