import { createFileRoute } from "@tanstack/react-router";
import { JobDetailPage } from "@/features/jobs/jobs-page";
import { pageHead } from "@/lib/page-head";
export const Route = createFileRoute("/_authenticated/app/open-jobs/$id")({
  head: () =>
    pageHead("Job details", "Read the job details and send your application on Work to Work."),
  component: Page,
});
function Page() {
  const { id } = Route.useParams();
  return <JobDetailPage id={id} />;
}
