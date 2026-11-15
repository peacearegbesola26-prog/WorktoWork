import { createFileRoute } from "@tanstack/react-router";
import { Discovery } from "@/components/work/workspace";
import { pageHead } from "@/lib/page-head";
export const Route = createFileRoute("/demo/web")({
  head: () => pageHead("Web Discovery", "Search the shared web opportunity demonstration records."),
  component: Page,
});
function Page() {
  return <Discovery web />;
}
