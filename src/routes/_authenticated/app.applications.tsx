import { createFileRoute } from "@tanstack/react-router";
import { ApplicationsPage } from "@/features/jobs/jobs-page";
import { jobApplicationsOptions } from "@/features/jobs/query";
import { pageHead } from "@/lib/page-head";
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const Route = createFileRoute("/_authenticated/app/applications")({
  head: () =>
    pageHead("Applications", "Review the applications sellers send to your jobs on Work to Work."),
  validateSearch: (search: Record<string, unknown>): { job?: string } =>
    typeof search["job"] === "string" && uuid.test(search["job"]) ? { job: search["job"] } : {},
  loader: ({ context }) => context.queryClient.ensureQueryData(jobApplicationsOptions),
  pendingComponent: () => (
    <p className="p-8" role="status">
      Loading applications…
    </p>
  ),
  component: Page,
});
function Page() {
  const { job } = Route.useSearch();
  return <ApplicationsPage initialJob={job ?? ""} />;
}
