import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/_authenticated/tracker")({
  beforeLoad: () => {
    throw redirect({ to: "/app/tracker", replace: true });
  },
});
