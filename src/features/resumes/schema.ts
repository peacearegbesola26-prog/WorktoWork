import { z } from "zod";
const text = z.string().max(15000);
export const resumeSchema = z.object({
  fullName: text,
  title: text,
  email: text,
  phone: text,
  location: text,
  summary: text,
  experience: text,
  education: text,
  skills: text,
  certifications: text,
  projects: text,
  portfolio: text,
});
export type ResumeContent = z.infer<typeof resumeSchema>;
export const blankResume: ResumeContent = {
  fullName: "",
  title: "",
  email: "",
  phone: "",
  location: "",
  summary: "",
  experience: "",
  education: "",
  skills: "",
  certifications: "",
  projects: "",
  portfolio: "",
};
export const labels: Record<keyof ResumeContent, string> = {
  fullName: "Full name",
  title: "Professional title",
  email: "Email",
  phone: "Phone",
  location: "Location",
  summary: "Professional summary",
  experience: "Work experience",
  education: "Education",
  skills: "Skills",
  certifications: "Certifications",
  projects: "Projects",
  portfolio: "Portfolio links",
};
export const modes = ["summary", "experience", "achievements", "feedback"] as const;
export type OptimizationMode = (typeof modes)[number];
export function missingInput(content: ResumeContent, mode: OptimizationMode) {
  if (mode === "summary" && !content.summary.trim() && !content.experience.trim())
    return "Add your summary or work experience first.";
  if ((mode === "experience" || mode === "achievements") && !content.experience.trim())
    return "Add your work experience, responsibilities and any real achievements first.";
  if (mode === "feedback" && !Object.values(content).some((v) => v.trim()))
    return "Add resume information first.";
  return null;
}
export function hasInventedNumbers(source: string, suggestion: string) {
  const known = new Set(source.match(/\d+(?:[.,]\d+)*/g) ?? []);
  return (suggestion.match(/\d+(?:[.,]\d+)*/g) ?? []).some((n) => !known.has(n));
}
