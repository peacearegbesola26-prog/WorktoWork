import { createFileRoute } from "@tanstack/react-router";
import { Alerts } from "@/components/work/workspace";
import { pageHead } from "@/lib/page-head";
export const Route = createFileRoute("/demo/alerts")({
  head: () => pageHead("Demo Alerts", "Create sample alert rules without sending notifications."),
  component: Page,
});
function Page() {
  return <Alerts />;
}
