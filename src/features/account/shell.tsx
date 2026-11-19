import { Suspense, useState, type ReactNode } from "react";
import { MarketplaceBadge } from "@/features/marketplace/workflow-page";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  Menu,
  Globe2,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
  LayoutDashboard,
  Search,
  Bookmark,
  BriefcaseBusiness,
  Bell,
  UserRound,
  Settings,
  LogOut,
  MessagesSquare,
  FileSignature,
  PackageCheck,
  Send,
  Wallet,
  PlusCircle,
  Inbox,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Brand } from "@/components/work/shared";
import { supabase } from "@/integrations/supabase/client";
import { useAccountAuth } from "./auth";
import { toast } from "sonner";
const common = [
  { to: "/app/notifications", label: "Notifications", icon: Bell },
  { to: "/app/messages", label: "Messages", icon: MessagesSquare },
  { to: "/app/contracts", label: "Contracts and Milestones", icon: FileSignature },
  { to: "/app/deliveries", label: "Deliveries", icon: PackageCheck },
] as const;
const sellerNav = [
  { to: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/app/open-jobs", label: "Open Jobs", icon: BriefcaseBusiness },
  { to: "/app/social", label: "Social Discovery", icon: Search },
  { to: "/app/web", label: "Web Discovery", icon: Globe2 },
  { to: "/app/direct", label: "Direct Work to Work", icon: BriefcaseBusiness },
  { to: "/app/my-applications", label: "My Applications", icon: Send },
  ...common,
  { to: "/app/earnings", label: "Earnings and Payouts", icon: Wallet },
  { to: "/app/toolkit", label: "Career Toolkit", icon: Sparkles },
  { to: "/app/saved", label: "Saved Opportunities", icon: Bookmark },
  { to: "/app/tracker", label: "Application Tracker", icon: BriefcaseBusiness },
  { to: "/app/alerts", label: "Alerts", icon: Bell },
  { to: "/app/profile", label: "Profile", icon: UserRound },
  { to: "/app/settings", label: "Settings", icon: Settings },
] as const;
const buyerNav = [
  { to: "/app/dashboard", label: "Hiring Dashboard", icon: LayoutDashboard },
  { to: "/app/post-job", label: "Post a Job", icon: PlusCircle },
  { to: "/app/jobs", label: "My Jobs", icon: BriefcaseBusiness },
  { to: "/app/applications", label: "Applications", icon: Inbox },
  ...common,
  { to: "/app/payments", label: "Payments", icon: Wallet },
  { to: "/app/profile", label: "Profile", icon: UserRound },
  { to: "/app/settings", label: "Settings", icon: Settings },
] as const;
const onboardingNav = [
  { to: "/app/onboarding", label: "Choose account type", icon: UserRound },
] as const;
export function SignOutButton({ staff = false }: { staff?: boolean }) {
  const client = useQueryClient();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  async function logout() {
    setBusy(true);
    try {
      await client.cancelQueries();
      client.clear();
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      if (staff) await navigate({ to: "/admin/login", replace: true });
      else await navigate({ to: "/auth", search: { next: "/app/dashboard" }, replace: true });
    } catch {
      toast.error("Sign out failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <Button variant="ghost" onClick={logout} disabled={busy}>
      <LogOut size={16} />
      {busy ? "Signing out…" : "Log out"}
    </Button>
  );
}
export function AccountShell({
  children,
  accountType = null,
}: {
  children: ReactNode;
  accountType?: "seller" | "buyer" | null;
}) {
  const nav =
    accountType === "buyer" ? buyerNav : accountType === "seller" ? sellerNav : onboardingNav;
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAccountAuth();
  const navigation = (
    <nav className="app-nav" aria-label="Account navigation">
      {nav.map((item) => (
        <Link
          key={item.to}
          // Marketplace sections resolve through /app/$section, so their paths are plain strings.
          to={item.to as "/app/dashboard"}
          onClick={() => setOpen(false)}
          activeProps={{ className: "active" }}
          title={collapsed ? item.label : undefined}
        >
          <item.icon size={19} />
          <span className={collapsed ? "hidden" : ""}>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
  return (
    <div className={`app-shell ${collapsed ? "sidebar-collapsed" : ""}`}>
      <aside className="desktop-sidebar">
        <Brand />
        {navigation}
        <div className="sidebar-bottom">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
          >
            {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
          </Button>
        </div>
      </aside>
      <div className="app-main">
        <header className="app-header">
          <div className="mobile-only">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button size="icon" variant="ghost" aria-label="Open account navigation">
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetTitle>Work to Work</SheetTitle>
                <SheetDescription>Your account workspace</SheetDescription>
                {navigation}
              </SheetContent>
            </Sheet>
          </div>
          <span className="header-breadcrumb">
            {accountType === "buyer"
              ? "Hiring workspace"
              : accountType === "seller"
                ? "Seller workspace"
                : "Your workspace"}
          </span>
          <div className="flex items-center gap-2">
            {accountType && <Suspense fallback={null}><MarketplaceBadge /></Suspense>}
            <Link to="/app/profile" className="avatar" aria-label="Your profile">
              {user?.email?.slice(0, 1).toUpperCase() ?? "W"}
            </Link>
            <SignOutButton />
          </div>
        </header>
        <main className="workspace-content">{children}</main>
        <footer className="app-footer">
          Work to Work · Your private workspace <Link to="/">Back to website</Link>
        </footer>
      </div>
    </div>
  );
}
