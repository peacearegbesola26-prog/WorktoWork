import { createFileRoute } from "@tanstack/react-router";
import { Tracker } from "@/components/work/workspace";
import { pageHead } from "@/lib/page-head";
export const Route = createFileRoute("/demo/tracker")({
  head: () =>
    pageHead("Application Tracker", "Organise sample applications and track their status."),
  component: Page,
});
function Page() {
  return <Tracker />;
}
