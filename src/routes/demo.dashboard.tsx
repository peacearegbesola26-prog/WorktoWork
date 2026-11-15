import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/components/work/workspace";
import { pageHead } from "@/lib/page-head";
export const Route = createFileRoute("/demo/dashboard")({
  head: () => pageHead("Dashboard", "Your sample opportunity workspace."),
  component: Page,
});
function Page() {
  return <Dashboard />;
}
