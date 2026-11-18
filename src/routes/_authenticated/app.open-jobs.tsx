import { createFileRoute, Outlet } from "@tanstack/react-router";
export const Route = createFileRoute("/_authenticated/app/open-jobs")({
  component: () => <Outlet />,
});
