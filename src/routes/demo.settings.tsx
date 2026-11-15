import { createFileRoute } from "@tanstack/react-router";
import { Settings } from "@/components/work/workspace";
import { pageHead } from "@/lib/page-head";
export const Route = createFileRoute("/demo/settings")({
  head: () => pageHead("Demo Settings", "Set safe demo preferences and reset sample records."),
  component: Page,
});
function Page() {
  return <Settings />;
}
