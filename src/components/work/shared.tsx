import { Link } from "@tanstack/react-router";
import { ArrowUpRight, ArrowRight, Search, Globe2, Sparkles, Menu } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAccountAuth } from "@/features/account/auth";
import { SignOutButton } from "@/features/account/shell";
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
export function StatusBadge({ children = "Not connected" }: { children?: ReactNode }) {
  return (
    <span className="demo-badge">
      <span />
      {children}
    </span>
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
export function PublicHeader() {
  const [open, setOpen] = useState(false);
  const { user, loading } = useAccountAuth();
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
          {loading ? (
            <span role="status">Checking session…</span>
          ) : user ? (
            <>
              <Button asChild>
                <Link to="/app/dashboard">My workspace</Link>
              </Button>
              <SignOutButton />
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link to="/login">Log in</Link>
              </Button>
              <Button asChild>
                <Link to="/signup">
                  Get started <ArrowUpRight />
                </Link>
              </Button>
            </>
          )}
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
                {user && (
                  <>
                    <Link to="/app/dashboard" onClick={() => setOpen(false)}>
                      My workspace
                    </Link>
                    <SignOutButton />
                  </>
                )}
                {(["/how-it-works", "/pricing", "/contact"] as const).map((to, i) => (
                  <Link key={to} to={to} onClick={() => setOpen(false)}>
                    {["How it works", "Pricing", "Contact"][i]}
                    <ArrowUpRight size={16} />
                  </Link>
                ))}
                {!user && (
                  <>
                    <Link to="/login" onClick={() => setOpen(false)}>
                      Log in
                    </Link>
                    <Link to="/signup" onClick={() => setOpen(false)}>
                      Get started
                    </Link>
                  </>
                )}
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
          <Link to="/app/dashboard">My workspace</Link>
        </nav>
      </div>
      <div className="site-container footer-bottom">
        <span>© 2026 Work to Work</span>
        <span>Accounts available · Live discovery coming later</span>
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
    <div className="field">
      <label className="field">
        <span>{label}</span>
        {children}
      </label>
      {hint && <small>{hint}</small>}
    </div>
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
        <p>AI processing is not connected. No content is sent or processed.</p>
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
    | "/app/social"
    | "/app/web"
    | "/app/dashboard"
    | "/signup"
    | "/app/toolkit"
    | "/app/resume-builder";
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
