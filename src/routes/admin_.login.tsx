import { createFileRoute } from "@tanstack/react-router";
import { StaffLoginPage } from "@/features/admin/login-page";
import { pageHead } from "@/lib/page-head";
export const Route = createFileRoute("/admin_/login")({
  head: () => pageHead("Staff login", "Sign in securely to Work to Work administration."),
  component: StaffLoginPage,
});
