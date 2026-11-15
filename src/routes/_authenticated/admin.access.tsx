import { createFileRoute } from "@tanstack/react-router";
import { StaffSettingsPage } from "@/features/admin/access-page";
import { pageHead } from "@/lib/page-head";
export const Route = createFileRoute("/_authenticated/admin/access")({
  head: () =>
    pageHead(
      "Staff access and AI controls",
      "Work to Work staff permissions and resume AI settings.",
    ),
  component: StaffSettingsPage,
});
