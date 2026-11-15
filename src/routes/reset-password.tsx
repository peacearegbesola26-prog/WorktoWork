import { createFileRoute } from "@tanstack/react-router";
import { AccountAuthPage } from "@/features/account/auth-page";
import { pageHead } from "@/lib/page-head";
export const Route = createFileRoute("/reset-password")({
  head: () => pageHead("Set a new password", "Securely reset your Work to Work account password."),
  component: () => <AccountAuthPage kind="reset" />,
});
