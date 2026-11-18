import { createContext, useContext, useEffect, type ReactNode } from "react";
import { useSuspenseQuery, useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "@tanstack/react-router";
import { publishedWebsiteOptions } from "./query";
import { defaultSettings, maintenanceBlocks, type WebsitePage, type SiteSettings } from "./schema";
import { useAccountAuth } from "@/features/account/auth";
import { getStaffPermissions } from "@/features/admin/admin.functions";
import { SignOutButton } from "@/features/account/shell";
import { Button } from "@/components/ui/button";
const WebsiteContext = createContext<{
  pages: Record<string, WebsitePage>;
  settings: SiteSettings;
}>({ pages: {}, settings: defaultSettings });
export function useWebsite() {
  return useContext(WebsiteContext);
}
export function brandImageUrl(path: string) {
  return path ? `/api/public/brand/${path.split("/").at(-1)}` : "";
}
export function WebsiteText({
  page,
  id,
  fallback,
}: {
  page: string;
  id: string;
  fallback: string;
}) {
  return useWebsite().pages[page]?.text[id] ?? fallback;
}
export function WebsiteProvider({
  children,
  override,
}: {
  children: ReactNode;
  override?: { pages: Record<string, WebsitePage>; settings: SiteSettings };
}) {
  const { data } = useSuspenseQuery(publishedWebsiteOptions);
  const value = override ?? data;
  const path = useLocation({ select: (l) => l.pathname });
  const { user, loading } = useAccountAuth();
  const staff = useQuery({
    queryKey: ["maintenance-staff", user?.id],
    queryFn: async (): Promise<string[]> => {
      try {
        return await getStaffPermissions();
      } catch {
        return [];
      }
    },
    enabled: value.settings.maintenance && !!user,
  });
  useEffect(() => {
    const root = document.documentElement;
    for (const [token, color] of [
      ["--primary", value.settings.primary],
      ["--foreground", value.settings.foreground],
    ]) {
      if (color) root.style.setProperty(token ?? "", color);
      else root.style.removeProperty(token ?? "");
    }
    const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (favicon) {
      favicon.href = brandImageUrl(value.settings.favicon) || "/favicon.ico";
      favicon.type = value.settings.favicon ? "image/png" : "image/x-icon";
    }
  }, [value.settings]);
  const blocked =
    value.settings.maintenance && maintenanceBlocks(path, !!staff.data?.includes("admin.access"));
  return (
    <WebsiteContext.Provider value={value}>
      {value.settings.announcement && (
        <div
          className="bg-primary text-primary-foreground px-6 py-3 text-center break-words"
          role="status"
        >
          {value.settings.announcement}
        </div>
      )}
      {blocked ? (
        <main className="auth-section min-h-screen">
          <div className="auth-wrap">
            <h1>{value.settings.displayName}</h1>
            <h2>Maintenance in progress</h2>
            <p>
              {loading || (user && staff.isPending) ? "Checking access…" : "We’ll be back soon."}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline">
                <Link to="/privacy">Privacy policy</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/contact">Contact</Link>
              </Button>
              {user ? (
                <>
                  <Button asChild>
                    <Link to="/app/settings">Account settings</Link>
                  </Button>
                  <SignOutButton />
                </>
              ) : (
                <Button asChild>
                  <Link to="/login" search={{ next: "/app/dashboard" }}>
                    Log in
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </main>
      ) : (
        children
      )}
    </WebsiteContext.Provider>
  );
}
