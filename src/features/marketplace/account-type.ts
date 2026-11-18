export type AccountType = "seller" | "buyer";
export const ACCOUNT_TYPES: { value: AccountType; label: string; description: string }[] = [
  { value: "seller", label: "Find Work — Seller / Freelancer", description: "Discover opportunities, apply and deliver work." },
  { value: "buyer", label: "Hire Talent — Buyer / Client", description: "Post jobs, review applications and hire." },
];
export function isAccountType(v: unknown): v is AccountType {
  return v === "seller" || v === "buyer";
}
/** Paths only seller accounts may open. */
export const SELLER_PATHS = [
  "/app/social", "/app/web", "/app/direct", "/app/opportunities", "/app/my-applications",
  "/app/earnings", "/app/toolkit", "/app/resume-builder", "/app/resume-optimizer",
  "/app/resume-tailoring", "/app/cover-letter", "/app/linkedin-optimizer",
  "/app/saved", "/app/tracker", "/app/alerts",
];
/** Paths only buyer accounts may open. */
export const BUYER_PATHS = ["/app/post-job", "/app/jobs", "/app/applications", "/app/payments"];
const matches = (path: string, list: string[]) =>
  list.some((p) => path === p || path.startsWith(p + "/"));
/** Where a user should go instead of `path`, or null when allowed. */
export function accountRedirect(type: AccountType | null, path: string): string | null {
  if (path === "/app/onboarding") return type ? "/app/dashboard" : null;
  if (!type) return "/app/onboarding";
  if (type === "buyer" && matches(path, SELLER_PATHS)) return "/app/dashboard";
  if (type === "seller" && matches(path, BUYER_PATHS)) return "/app/dashboard";
  return null;
}
