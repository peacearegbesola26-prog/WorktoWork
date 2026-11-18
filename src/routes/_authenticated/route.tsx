import { getRouteApi, createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { AccountShell } from "@/features/account/shell";
import { accountRedirect, isAccountType, type AccountType } from "@/features/marketplace/account-type";
export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth", search: { next: location.href } });
    const row = await supabase
      .from("marketplace_accounts")
      .select("account_type")
      .eq("user_id", data.user.id)
      .maybeSingle();
    const accountType: AccountType | null = isAccountType(row.data?.account_type) ? row.data.account_type : null;
    if (!row.error) {
      const to = accountRedirect(accountType, location.pathname);
      if (to) throw redirect({ to, replace: true });
    }
    return { accountType };
  },
  component: Layout,
});
function Layout() {
  const { accountType } = getRouteApi("/_authenticated").useRouteContext();
  return (
    <AccountShell accountType={accountType}>
      <Outlet />
    </AccountShell>
  );
}
