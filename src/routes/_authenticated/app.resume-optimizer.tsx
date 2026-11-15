import { createFileRoute } from "@tanstack/react-router";
import { CareerPage } from "@/features/account/career";
import { workspaceOptions } from "@/features/account/query";
import { pageHead } from "@/lib/page-head";
export const Route = createFileRoute("/_authenticated/app/resume-optimizer")({
  head: () => pageHead("Resume Optimizer", "Your Work to Work resume optimizer workspace."),

  pendingComponent: () => (
    <p className="p-8" role="status">
      Loading your workspace…
    </p>
  ),
  component: () => <CareerPage view="resume-optimizer" />,
});
