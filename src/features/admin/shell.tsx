import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Menu,
  ShieldCheck,
  LayoutDashboard,
  BriefcaseBusiness,
  Users,
  Settings,
  Globe2,
  ScrollText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SignOutButton } from "@/features/account/shell";
import { getStaffPermissions } from "./admin.functions";
const items = [
  { to: "/admin/content", label: "Website content", icon: Globe2, permission: "content.manage" },
  { to: "/admin/site-settings", label: "Site settings", icon: Settings, permission: "site.manage" },
  { to: "/admin", label: "Overview", icon: LayoutDashboard, permission: "admin.access" },
  {
    to: "/admin/opportunities",
    label: "Opportunities",
    icon: BriefcaseBusiness,
    permission: "opportunities.manage",
  },
  { to: "/admin/users", label: "Users", icon: Users, permission: "users.manage" },
  { to: "/admin/sources", label: "Sources", icon: Globe2, permission: "sources.manage" },
  { to: "/admin/audit", label: "Audit trail", icon: ScrollText, permission: "audit.read" },
  { to: "/admin/access", label: "Access and AI controls", icon: Settings, permission: "ai.manage" },
] as const;
export function StaffShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const load = useServerFn(getStaffPermissions);
  const { data } = useQuery({
    queryKey: ["staff-permissions"],
    queryFn: () => load(),
    staleTime: 0,
  });
  const navigation = (
    <nav className="app-nav" aria-label="Staff navigation">
      {items
        .filter((item) => data?.includes(item.permission))
        .map((item) => (
          <Link
            key={item.to}
            to={item.to}
            activeOptions={{ exact: item.to === "/admin" }}
            activeProps={{ className: "active" }}
            onClick={() => setOpen(false)}
          >
            <item.icon size={19} />
            <span>{item.label}</span>
          </Link>
        ))}
    </nav>
  );
  return (
    <div className="app-shell">
      <aside className="desktop-sidebar">
        <Link to="/admin" className="brand">
          <ShieldCheck size={24} />
          <span>Work to Work</span>
        </Link>
        <p className="text-sm text-muted-foreground mb-6">Staff control panel</p>
        {navigation}
      </aside>
      <div className="app-main">
        <header className="app-header">
          <div className="mobile-only">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button size="icon" variant="ghost" aria-label="Open staff navigation">
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetTitle>Work to Work staff</SheetTitle>
                <SheetDescription>Control panel</SheetDescription>
                {navigation}
              </SheetContent>
            </Sheet>
          </div>
          <span className="header-breadcrumb">Staff control panel</span>
          <SignOutButton staff />
        </header>
        <main className="workspace-content">{children}</main>
        <footer className="app-footer">Work to Work · Staff area</footer>
      </div>
    </div>
  );
}
export function StaffAccessDenied() {
  return (
    <main className="auth-section min-h-screen">
      <div className="auth-wrap">
        <h1>Access denied</h1>
        <Button asChild variant="outline">
          <Link to="/admin/login">Staff login</Link>
        </Button>
      </div>
    </main>
  );
}
