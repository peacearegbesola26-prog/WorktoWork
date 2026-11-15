import { createFileRoute } from "@tanstack/react-router";
import { OpportunityDetails } from "@/components/work/workspace";
import { opportunities } from "@/features/demo/model";
import { pageHead } from "@/lib/page-head";
export const Route = createFileRoute("/demo/opportunities/$id")({
  head: ({ params }) =>
    pageHead(
      opportunities.find((o) => o.id === params.id)?.title ?? "Sample Not Found",
      "Fictional opportunity details in the Work to Work demonstration.",
    ),
  component: Page,
});
function Page() {
  const { id } = Route.useParams();
  return <OpportunityDetails id={id} />;
}
