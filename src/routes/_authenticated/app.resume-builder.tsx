import { createFileRoute } from "@tanstack/react-router";
import { CareerPage } from "@/features/account/career";
import { resumesOptions } from "@/features/resumes/query";
import { pageHead } from "@/lib/page-head";
export const Route = createFileRoute("/_authenticated/app/resume-builder")({
  head: () => pageHead("Resume Builder", "Your Work to Work resume builder workspace."),

  loader: ({ context }) => context.queryClient.ensureQueryData(resumesOptions),
  pendingComponent: () => (
    <p className="p-8" role="status">
      Loading your workspace…
    </p>
  ),
  component: () => <CareerPage view="resume-builder" />,
});
