import { Link } from "@tanstack/react-router";
import { FileText, Sparkles, BriefcaseBusiness, UserRound, Mail } from "lucide-react";
import { ResumePage } from "@/features/resumes/resume-page";
import { Button } from "@/components/ui/button";
import { PageHeading, AIRequired, EmptyState } from "@/components/work/shared";
const tools = [
  {
    title: "Resume Builder",
    description: "Bring your experience together with a live resume preview.",
    to: "/app/resume-builder",
    icon: FileText,
    available: true,
  },
  {
    title: "Resume Optimizer",
    description: "Review your summary, experience and achievements with factual AI suggestions.",
    to: "/app/resume-optimizer",
    icon: Sparkles,
    available: true,
  },
  {
    title: "Job-specific Resume Tailoring",
    description: "Prepare for a specific opportunity with suggestions you approve.",
    to: "/app/resume-tailoring",
    icon: BriefcaseBusiness,
    available: false,
  },
  {
    title: "LinkedIn Profile Optimizer",
    description: "Refine your headline and experience when AI processing is connected.",
    to: "/app/linkedin-optimizer",
    icon: UserRound,
    available: false,
  },
  {
    title: "Cover Letter Generator",
    description: "Prepare opportunity-specific cover letters when AI processing is connected.",
    to: "/app/cover-letter",
    icon: Mail,
    available: false,
  },
] as const;
export function CareerPage({
  view,
}: {
  view:
    | "toolkit"
    | "resume-builder"
    | "resume-optimizer"
    | "resume-tailoring"
    | "linkedin-optimizer"
    | "cover-letter";
}) {
  if (view === "resume-builder") return <ResumePage />;
  if (view === "resume-optimizer") return <ResumePage optimizer />;
  if (view !== "toolkit")
    return (
      <>
        <PageHeading
          title={tools.find((t) => t.to === "/app/" + view)?.title ?? "Career tool"}
          description="AI processing is not connected."
        />
        <AIRequired />
        <EmptyState
          title="This tool is not connected yet"
          description="No resume is uploaded, no text is processed, and no AI result is generated."
        />
        <Button asChild variant="outline">
          <Link to="/app/toolkit">Back to Career Toolkit</Link>
        </Button>
      </>
    );
  return (
    <>
      <PageHeading
        eyebrow="PUT YOUR BEST WORK FORWARD"
        title="Career Toolkit"
        description="A stronger application starts with a clearer story."
      />
      <p className="legal-note">
        Save private resumes and request AI suggestions. Resume uploads and the other AI career
        tools are not connected.
      </p>
      <div className="toolkit-grid">
        {tools.map((t) => (
          <article key={t.title} className="toolkit-card">
            <div className="feature-icon">
              <t.icon size={22} />
            </div>
            <h2>{t.title}</h2>
            <p>{t.description}</p>
            <Button asChild variant={t.available ? "default" : "outline"}>
              <Link to={t.to}>{t.available ? "Open tool" : "View availability"}</Link>
            </Button>
            {!t.available && <p className="sample-label mt-3">AI not connected</p>}
          </article>
        ))}
      </div>
    </>
  );
}
