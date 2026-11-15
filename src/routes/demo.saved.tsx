import { createFileRoute } from "@tanstack/react-router";
import { Saved } from "@/components/work/workspace";
import { pageHead } from "@/lib/page-head";
export const Route = createFileRoute("/demo/saved")({
  head: () => pageHead("Saved Opportunities", "Your saved demonstration opportunity shortlist."),
  component: Page,
});
function Page() {
  return <Saved />;
}
