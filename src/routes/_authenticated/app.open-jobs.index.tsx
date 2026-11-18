import { createFileRoute } from "@tanstack/react-router";
import { BrowseJobsPage } from "@/features/jobs/jobs-page";
import { pageHead } from "@/lib/page-head";
export const Route = createFileRoute("/_authenticated/app/open-jobs/")({
  head: () => pageHead("Open jobs", "Browse jobs hiring accounts have published on Work to Work."),
  component: BrowseJobsPage,
});
