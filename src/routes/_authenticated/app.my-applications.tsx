import { createFileRoute } from "@tanstack/react-router";
import { MyApplicationsPage } from "@/features/jobs/jobs-page";
import { myApplicationsOptions } from "@/features/jobs/query";
import { pageHead } from "@/lib/page-head";
export const Route = createFileRoute("/_authenticated/app/my-applications")({
  head: () => pageHead("My applications", "Track every job you have applied for on Work to Work."),
  loader: ({ context }) => context.queryClient.ensureQueryData(myApplicationsOptions),
  pendingComponent: () => (
    <p className="p-8" role="status">
      Loading your applications…
    </p>
  ),
  component: MyApplicationsPage,
});
