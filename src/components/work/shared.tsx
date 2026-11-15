import { brandImageUrl, useWebsite, WebsiteText } from "@/features/website/context";
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
  const { settings } = useWebsite();
  if (settings.logo)
    return (
      <Link to="/" className="brand" aria-label={`${settings.displayName} home`}>
        <img
          src={brandImageUrl(settings.logo)}
          alt={settings.displayName}
          className="h-9 max-w-40 object-contain"
        />
        <span>{settings.displayName}</span>
      </Link>
    );
  if (settings.displayName !== "Work to Work")
    return (
      <Link to="/" className="brand">
        {settings.displayName}
      </Link>
    );
  return (
    <Link to="/" className="brand" aria-label="Work to Work home">
      <span className="brand-mark">
        <ArrowUpRight size={23} />
      </span>
      <span>
        <WebsiteText page="footer" id="1" fallback="work" />
        <span className="text-primary">
          <WebsiteText page="footer" id="2" fallback="to" />
        </span>
        <WebsiteText page="footer" id="3" fallback="work" />
        <span className="brand-dot">
          <WebsiteText page="footer" id="4" fallback="." />
        </span>
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
            <WebsiteText page="footer" id="5" fallback="How it works" />
          </Link>
          <Link to="/pricing" activeProps={{ className: "active" }}>
            <WebsiteText page="footer" id="6" fallback="Pricing" />
          </Link>
          <Link to="/contact" activeProps={{ className: "active" }}>
            <WebsiteText page="footer" id="7" fallback="Contact" />
          </Link>
        </nav>
        <div className="header-actions">
          {loading ? (
            <span role="status">
              <WebsiteText page="footer" id="8" fallback="Checking session…" />
            </span>
          ) : user ? (
            <>
              <Button asChild>
                <Link to="/app/dashboard">
                  <WebsiteText page="footer" id="9" fallback="My workspace" />
                </Link>
              </Button>
              <SignOutButton />
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link to="/login" search={{ next: "/app/dashboard" }}>
                  <WebsiteText page="footer" id="10" fallback="Log in" />
                </Link>
              </Button>
              <Button asChild>
                <Link to="/signup" search={{ next: "/app/dashboard" }}>
                  <WebsiteText page="footer" id="11" fallback="Get started" />
                  <ArrowUpRight />
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
              <SheetTitle>
                <WebsiteText page="footer" id="12" fallback="Work to Work" />
              </SheetTitle>
              <SheetDescription>
                <WebsiteText page="footer" id="13" fallback="Find your next chapter" />
              </SheetDescription>
              <nav className="drawer-nav">
                {user && (
                  <>
                    <Link to="/app/dashboard" onClick={() => setOpen(false)}>
                      <WebsiteText page="footer" id="14" fallback="My workspace" />
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
                    <Link
                      to="/login"
                      search={{ next: "/app/dashboard" }}
                      onClick={() => setOpen(false)}
                    >
                      <WebsiteText page="footer" id="15" fallback="Log in" />
                    </Link>
                    <Link
                      to="/signup"
                      search={{ next: "/app/dashboard" }}
                      onClick={() => setOpen(false)}
                    >
                      <WebsiteText page="footer" id="16" fallback="Get started" />
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
  const { pages } = useWebsite();
  return (
    <footer className="public-footer">
      <div className="site-container footer-top">
        <div>
          <Brand />
          <p>
            <WebsiteText
              page="footer"
              id="17"
              fallback="More possibilities. A stronger next chapter."
            />
          </p>
        </div>
        <nav aria-label="Footer navigation">
          <Link to="/about">About</Link>
          <Link to="/faqs">FAQs</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
          {pages.footer?.links.map((l, i) => (
            <a key={i} href={l.url} rel="noopener noreferrer">
              {l.label}
            </a>
          ))}
          <Link to="/how-it-works">
            <WebsiteText page="footer" id="18" fallback="How it works" />
          </Link>
          <Link to="/pricing">
            <WebsiteText page="footer" id="19" fallback="Pricing" />
          </Link>
          <Link to="/contact">
            <WebsiteText page="footer" id="20" fallback="Contact" />
          </Link>
          <Link to="/app/dashboard">
            <WebsiteText page="footer" id="21" fallback="My workspace" />
          </Link>
        </nav>
      </div>
      <div className="site-container footer-bottom">
        <span>
          <WebsiteText page="footer" id="22" fallback="© 2026 Work to Work" />
        </span>
        <span>
          <WebsiteText
            page="footer"
            id="23"
            fallback="Accounts available · Live discovery coming later"
          />
        </span>
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
        <strong>
          <WebsiteText page="footer" id="24" fallback="AI connection required" />
        </strong>
        <p>
          <WebsiteText
            page="footer"
            id="25"
            fallback="AI processing is not connected. No content is sent or processed."
          />
        </p>
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
