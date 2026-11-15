import { createFileRoute } from "@tanstack/react-router";
import { OpportunityDetailPage } from "@/features/discovery/discovery-page";
import { pageHead } from "@/lib/page-head";
export const Route = createFileRoute("/_authenticated/app/opportunities/$id")({
  head: () =>
    pageHead(
      "Opportunity details",
      "View real opportunity details and application information on Work to Work.",
    ),
  component: Page,
});
function Page() {
  const { id } = Route.useParams();
  return <OpportunityDetailPage id={id} />;
}
