import { createFileRoute, redirect } from "@tanstack/react-router";
import { pageHead } from "@/lib/page-head";
export const Route = createFileRoute("/_authenticated/app/admin")({
  head: () => pageHead("Admin", "Your Work to Work admin workspace."),

  beforeLoad: () => {
    throw redirect({ to: "/admin", replace: true });
  },
});
