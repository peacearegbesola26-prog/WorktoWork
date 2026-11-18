import { createFileRoute } from "@tanstack/react-router";
import { PostJobPage } from "@/features/jobs/jobs-page";
import { myJobsOptions } from "@/features/jobs/query";
import { pageHead } from "@/lib/page-head";
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const Route = createFileRoute("/_authenticated/app/post-job")({
  head: () =>
    pageHead("Post a job", "Draft and publish a job for seller accounts on Work to Work."),
  validateSearch: (search: Record<string, unknown>): { job?: string } =>
    typeof search["job"] === "string" && uuid.test(search["job"]) ? { job: search["job"] } : {},
  loader: ({ context }) => context.queryClient.ensureQueryData(myJobsOptions),
  pendingComponent: () => (
    <p className="p-8" role="status">
      Loading your jobs…
    </p>
  ),
  component: Page,
});
function Page() {
  const { job } = Route.useSearch();
  return <PostJobPage jobId={job ?? ""} />;
}
