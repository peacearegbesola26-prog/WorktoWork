import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/_authenticated/opportunities")({
  beforeLoad: () => {
    throw redirect({ to: "/app/social", replace: true });
  },
});
