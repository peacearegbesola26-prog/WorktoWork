import { createFileRoute } from "@tanstack/react-router";
import { WorkspacePage } from "@/features/account/workspace";
import { workspaceOptions } from "@/features/account/query";
import { pageHead } from "@/lib/page-head";
export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => pageHead("Dashboard", "Your private Work to Work dashboard workspace."),
  loader: ({ context }) => context.queryClient.ensureQueryData(workspaceOptions),
  pendingComponent: () => (
    <p className="p-8" role="status">
      Loading your workspace…
    </p>
  ),
  component: () => <WorkspacePage view="dashboard" />,
});
