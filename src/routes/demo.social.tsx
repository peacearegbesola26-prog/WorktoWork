import { createFileRoute } from "@tanstack/react-router";
import { Discovery } from "@/components/work/workspace";
import { pageHead } from "@/lib/page-head";
export const Route = createFileRoute("/demo/social")({
  head: () =>
    pageHead("Social Discovery", "Search fictional sample opportunities across social sources."),
  component: Page,
});
function Page() {
  return <Discovery />;
}
