import { createFileRoute } from "@tanstack/react-router";
import { AdminUsersPage } from "@/features/admin/users-page";
import { pageHead } from "@/lib/page-head";
export const Route = createFileRoute("/_authenticated/admin/users")({
  head: () =>
    pageHead(
      "User administration",
      "Work to Work account verification, activity and suspension management.",
    ),
  component: AdminUsersPage,
});
