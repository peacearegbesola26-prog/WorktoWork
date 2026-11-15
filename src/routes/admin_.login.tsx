import { createFileRoute } from "@tanstack/react-router";
import { AccountAuthPage } from "@/features/account/auth-page";
import { pageHead } from "@/lib/page-head";
export const Route = createFileRoute("/admin_/login")({
  head: () => pageHead("Staff login", "Sign in securely to Work to Work administration."),
  component: () => <AccountAuthPage kind="login" next="/admin" />,
});
