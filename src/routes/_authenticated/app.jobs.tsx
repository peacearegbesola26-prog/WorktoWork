import { createFileRoute } from "@tanstack/react-router";
import { MyJobsPage } from "@/features/jobs/jobs-page";
import { myJobsOptions } from "@/features/jobs/query";
import { pageHead } from "@/lib/page-head";
export const Route = createFileRoute("/_authenticated/app/jobs")({
  head: () =>
    pageHead("My jobs", "See your drafts, published, closed and archived jobs on Work to Work."),
  loader: ({ context }) => context.queryClient.ensureQueryData(myJobsOptions),
  pendingComponent: () => (
    <p className="p-8" role="status">
      Loading your jobs…
    </p>
  ),
  component: MyJobsPage,
});
