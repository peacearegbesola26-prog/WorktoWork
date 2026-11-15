import { Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Bookmark,
  MapPin,
  Clock,
  BriefcaseBusiness,
  ArrowRight,
  Search,
  Globe2,
  Sparkles,
  LayoutDashboard,
  Bell,
  FileText,
  Settings,
  UserRound,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useDemo } from "@/features/demo/context";
import { type Opportunity } from "@/features/demo/model";
export function Brand() {
  return (
    <Link to="/" className="brand" aria-label="Work to Work home">
      <span className="brand-mark">
        <ArrowUpRight size={23} />
      </span>
      <span>
        work<span className="text-primary">to</span>work<span className="brand-dot">.</span>
      </span>
    </Link>
  );
}
export function DemoBadge({ children = "Demo mode" }: { children?: ReactNode }) {
  return (
    <span className="demo-badge">
      <span />
      {children}
    </span>
  );
}
export function DemoNotice({ children }: { children?: ReactNode }) {
  return (
    <div className="demo-notice">
      <span className="notice-icon">
        <Sparkles size={16} />
      </span>
      <p>
        {children ?? (
          <>
            You’re exploring a demonstration. All opportunities are fictional sample records. Live
            sources and AI are not connected.
          </>
        )}
      </p>
      <DemoBadge />
    </div>
  );
}
export function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}
export function EmptyState({
  title = "No opportunities found",
  description = "Try adjusting your filters or exploring another source.",
  action,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <Search size={28} />
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}
export function SourceIcon({ source }: { source: string }) {
  return (
    <span className={`source-icon source-${source.toLowerCase()}`}>
      {source === "LinkedIn" ? (
        "in"
      ) : source === "Facebook" ? (
        "f"
      ) : source === "Instagram" ? (
        "◎"
      ) : source === "TikTok" ? (
        "♪"
      ) : source === "Reddit" ? (
        "r/"
      ) : (
        <Globe2 size={18} />
      )}
    </span>
  );
}
export function OpportunityCard({
  opportunity: o,
  compact = false,
}: {
  opportunity: Opportunity;
  compact?: boolean;
}) {
  const demo = useDemo();
  const saved = demo.saved.includes(o.id);
  return (
    <article className={`opportunity-card ${compact ? "compact" : ""}`}>
      <div className="card-top">
        <div className="flex items-center gap-3">
          <SourceIcon source={o.source} />
          <div>
            <span className="source-name">{o.source}</span>
            <span className="sample-label">Sample opportunity</span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          title={saved ? "Unsave opportunity" : "Save opportunity"}
          aria-label={`${saved ? "Unsave" : "Save"} ${o.title}`}
          onClick={() => demo.toggleSaved(o.id)}
        >
          <Bookmark className={saved ? "saved-icon" : ""} />
        </Button>
      </div>
      <h3>
        <Link to="/demo/opportunities/$id" params={{ id: o.id }}>
          {o.title}
        </Link>
      </h3>
      <p className="company">{o.company}</p>
      <p className="opportunity-summary">{o.summary}</p>
      <div className="opportunity-meta">
        <span>
          <MapPin />
          {o.country ?? "Unknown"}
        </span>
        <span>
          <BriefcaseBusiness />
          {o.remote} · {o.type}
        </span>
      </div>
      <div className="skills">
        {o.skills.map((s) => (
          <span key={s}>{s}</span>
        ))}
      </div>
      <div className="card-footer">
        <span>
          <Clock size={13} />{" "}
          {o.posted
            ? new Date(o.posted + "T00:00:00").toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "Posted: Unknown"}
        </span>
        <Button variant="link" asChild>
          <Link to="/demo/opportunities/$id" params={{ id: o.id }}>
            View details <ArrowUpRight />
          </Link>
        </Button>
      </div>
      {!compact && <p className="checked">Last checked: {o.checked ?? "Unknown"}</p>}
    </article>
  );
}
const appNav = [
  { label: "Dashboard", to: "/demo/dashboard", icon: LayoutDashboard },
  { label: "Social Discovery", to: "/demo/social", icon: Search },
  { label: "Web Discovery", to: "/demo/web", icon: Globe2 },
  { label: "Saved Opportunities", to: "/demo/saved", icon: Bookmark },
  { label: "Application Tracker", to: "/demo/tracker", icon: BriefcaseBusiness },
  { label: "Alerts", to: "/demo/alerts", icon: Bell },
  { label: "Career Toolkit", to: "/demo/toolkit", icon: Sparkles },
  { label: "Profile", to: "/demo/profile", icon: UserRound },
  { label: "Settings", to: "/demo/settings", icon: Settings },
] as const;
function AppNav({
  collapsed = false,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const demo = useDemo();
  return (
    <nav className="app-nav" aria-label="Application navigation">
      {appNav.map((item, index) => (
        <div key={item.to}>
          {(index === 0 || index === 6 || index === 7) && !collapsed && (
            <p className="nav-group">
              {index === 0 ? "WORKSPACE" : index === 6 ? "YOUR CAREER" : "ACCOUNT"}
            </p>
          )}
          <Link
            to={item.to}
            onClick={onNavigate}
            activeProps={{ className: "active" }}
            title={collapsed ? item.label : undefined}
          >
            <item.icon size={19} />
            {!collapsed && (
              <>
                <span>{item.label}</span>
                {item.to === "/demo/saved" && <small>{demo.saved.length}</small>}
              </>
            )}
          </Link>
        </div>
      ))}
    </nav>
  );
}
export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [open, setOpen] = useState(false);
  return (
    <div className={`app-shell ${collapsed ? "sidebar-collapsed" : ""}`}>
      <aside className="desktop-sidebar">
        <Brand />
        <AppNav collapsed={collapsed} />
        <div className="sidebar-bottom">
          {!collapsed && (
            <>
              <DemoBadge />
              <p>Your next chapter starts here.</p>
            </>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? "Expand navigation" : "Collapse navigation"}
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
                <Button variant="ghost" size="icon" aria-label="Open navigation">
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetTitle>
                  <Brand />
                </SheetTitle>
                <SheetDescription>Demonstration workspace</SheetDescription>
                <AppNav onNavigate={() => setOpen(false)} />
              </SheetContent>
            </Sheet>
          </div>
          <span className="header-breadcrumb">
            Workspace <span>/</span> <strong>Work to Work</strong>
          </span>
          <div className="flex items-center gap-4">
            <DemoBadge />
            <Link to="/demo/alerts" title="Demo alerts" className="header-icon">
              <Bell size={19} />
            </Link>
            <Link to="/demo/profile" className="avatar" aria-label="Demo profile">
              D
            </Link>
          </div>
        </header>
        <main className="workspace-content">{children}</main>
        <footer className="app-footer">
          Work to Work · Frontend demonstration{" "}
          <Link to="/">
            Back to website <ArrowUpRight size={13} />
          </Link>
        </footer>
      </div>
    </div>
  );
}
export function PublicHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="public-header">
      <div className="site-container header-inner">
        <Brand />
        <nav className="public-nav" aria-label="Website navigation">
          <Link to="/how-it-works" activeProps={{ className: "active" }}>
            How it works
          </Link>
          <Link to="/pricing" activeProps={{ className: "active" }}>
            Pricing
          </Link>
          <Link to="/contact" activeProps={{ className: "active" }}>
            Contact
          </Link>
        </nav>
        <div className="header-actions">
          <Button variant="ghost" asChild>
            <Link to="/login">Log in</Link>
          </Button>
          <Button asChild>
            <Link to="/signup">
              Get started <ArrowUpRight />
            </Link>
          </Button>
        </div>
        <div className="mobile-only">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open website navigation">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetTitle>Work to Work</SheetTitle>
              <SheetDescription>Find your next chapter</SheetDescription>
              <nav className="drawer-nav">
                {(
                  [
                    "/how-it-works",
                    "/pricing",
                    "/contact",
                    "/login",
                    "/signup",
                    "/demo/dashboard",
                  ] as const
                ).map((to, i) => (
                  <Link key={to} to={to} onClick={() => setOpen(false)}>
                    {
                      [
                        "How it works",
                        "Pricing",
                        "Contact",
                        "Log in",
                        "Get started",
                        "Explore the demo",
                      ][i]
                    }
                    <ArrowUpRight size={16} />
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
export function PublicFooter() {
  return (
    <footer className="public-footer">
      <div className="site-container footer-top">
        <div>
          <Brand />
          <p>More possibilities. A stronger next chapter.</p>
        </div>
        <nav aria-label="Footer navigation">
          <Link to="/how-it-works">How it works</Link>
          <Link to="/pricing">Pricing</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/demo/dashboard">Explore demo</Link>
        </nav>
      </div>
      <div className="site-container footer-bottom">
        <span>© 2026 Work to Work</span>
        <span>Stage 1 · Frontend demonstration</span>
      </div>
    </footer>
  );
}
export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <>
      <PublicHeader />
      <main>{children}</main>
      <PublicFooter />
    </>
  );
}
export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  );
}
export function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <Field label={label}>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o} value={o}>
            {o === "All" ? "All " + label.toLowerCase() : o}
          </option>
        ))}
      </select>
    </Field>
  );
}
export function AIRequired() {
  return (
    <div className="integration-state">
      <Sparkles size={22} />
      <div>
        <strong>AI connection required</strong>
        <p>No AI processing is available in this demonstration.</p>
      </div>
    </div>
  );
}
export function ActionLink({
  to,
  children,
  outline = false,
}: {
  to:
    | "/demo/social"
    | "/demo/web"
    | "/demo/dashboard"
    | "/signup"
    | "/demo/toolkit"
    | "/demo/resume-builder";
  children: ReactNode;
  outline?: boolean;
}) {
  return (
    <Button asChild variant={outline ? "outline" : "default"} size="lg">
      <Link to={to}>
        {children}
        <ArrowRight />
      </Link>
    </Button>
  );
}
