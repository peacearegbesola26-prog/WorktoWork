import { createFileRoute } from "@tanstack/react-router";
import { WorkspacePage } from "@/features/account/workspace";
import { workspaceOptions } from "@/features/account/query";
import { pageHead } from "@/lib/page-head";
export const Route = createFileRoute("/_authenticated/saved")({
  head: () => pageHead("Saved", "Your private Work to Work saved workspace."),
  loader: ({ context }) => context.queryClient.ensureQueryData(workspaceOptions),
  pendingComponent: () => (
    <p className="p-8" role="status">
      Loading your workspace…
    </p>
  ),
  component: () => <WorkspacePage view="saved" />,
});
