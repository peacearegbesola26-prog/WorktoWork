import { z } from "zod";
export const pageKeys = [
  "home",
  "public",
  "footer",
  "contact",
  "pricing",
  "about",
  "privacy",
  "terms",
  "faqs",
] as const;
export const safeLink = z
  .string()
  .max(2048)
  .refine((v) => {
    if (v === "") return true;
    if (/^\/(?!\/)[a-z0-9/?.=&_%#-]*$/i.test(v)) return true;
    try {
      const u = new URL(v);
      return u.protocol === "https:" && !u.username && !u.password;
    } catch {
      return false;
    }
  }, "Use a site path or an HTTPS URL.");
export const pageSchema = z
  .object({
    title: z.string().trim().min(1).max(150),
    description: z.string().trim().min(1).max(500),
    text: z.record(z.string().max(20000)),
    faqs: z
      .array(
        z.object({
          question: z.string().trim().min(1).max(500),
          answer: z.string().trim().min(1).max(5000),
        }),
      )
      .max(100),
    links: z
      .array(z.object({ label: z.string().trim().min(1).max(100), url: safeLink }))
      .max(20)
      .default([]),
    primaryCta: safeLink.default("/signup"),
    secondaryCta: safeLink.default("/app/dashboard"),
  })
  .strict();
function luminance(hex: string) {
  const a = [1, 3, 5].map((i) => {
    const v = parseInt(hex.slice(i, i + 2), 16) / 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return (a[0] ?? 0) * 0.2126 + (a[1] ?? 0) * 0.7152 + (a[2] ?? 0) * 0.0722;
}
const colour = z
  .string()
  .refine((v) => v === "" || /^#[\da-f]{6}$/i.test(v), "Use a six-digit hex colour.")
  .refine(
    (v) => v === "" || 1.05 / (luminance(v) + 0.05) >= 4.5,
    "Choose a colour with readable contrast against white.",
  );
const asset = z.string().regex(/^$|^brand\/[0-9a-f-]+\.(png|jpg|webp)$/);
export const settingsSchema = z
  .object({
    displayName: z.string().trim().min(1).max(100),
    logo: asset,
    favicon: asset,
    primary: colour,
    foreground: colour,
    supportEmail: z.union([z.literal(""), z.string().email().max(254)]),
    announcement: z.string().max(300),
    maintenance: z.boolean(),
    registrationEnabled: z.boolean(),
  })
  .strict();
export type WebsitePage = z.infer<typeof pageSchema>;
export type SiteSettings = z.infer<typeof settingsSchema>;
export const defaultSettings: SiteSettings = {
  displayName: "Work to Work",
  logo: "",
  favicon: "",
  primary: "",
  foreground: "",
  supportEmail: "",
  announcement: "",
  maintenance: false,
  registrationEnabled: true,
};
export function imageFormat(bytes: Uint8Array): "png" | "jpg" | "webp" | null {
  if (bytes.length > 2 * 1024 * 1024 || bytes.length < 12) return null;
  if ([137, 80, 78, 71, 13, 10, 26, 10].every((v, i) => bytes[i] === v)) return "png";
  if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return "jpg";
  if (
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
  )
    return "webp";
  return null;
}
export function maintenanceBlocks(path: string, staff: boolean) {
  return (
    !staff &&
    !(
      /^\/admin(?:\/|$)/.test(path) ||
      [
        "/login",
        "/auth",
        "/forgot-password",
        "/reset-password",
        "/email-verification",
        "/privacy",
        "/terms",
        "/contact",
        "/app/settings",
        "/app/profile",
      ].includes(path)
    )
  );
}
