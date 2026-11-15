import { createFileRoute } from "@tanstack/react-router";
import { Toolkit } from "@/components/work/workspace";
import { pageHead } from "@/lib/page-head";
export const Route = createFileRoute("/demo/toolkit")({
  head: () => pageHead("Career Toolkit", "Explore resume editing and planned career tools."),
  component: Page,
});
function Page() {
  return <Toolkit />;
}
