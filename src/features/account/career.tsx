import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  FileText,
  Sparkles,
  BriefcaseBusiness,
  UserRound,
  Mail,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeading, Field, AIRequired, EmptyState } from "@/components/work/shared";
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
    description: "Review structure, clarity and achievements when AI processing is connected.",
    to: "/app/resume-optimizer",
    icon: Sparkles,
    available: false,
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
  if (view === "resume-builder") return <ResumeBuilder />;
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
        Resume editing is available for this session only. AI processing and resume uploads are not
        connected.
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
              <Link to={t.to}>{t.available ? "Start building" : "View availability"}</Link>
            </Button>
            {!t.available && <p className="sample-label mt-3">AI not connected</p>}
          </article>
        ))}
      </div>
    </>
  );
}
function ResumeBuilder() {
  const [resume, setResume] = useState({
    name: "",
    title: "",
    summary: "",
    experience: "",
    education: "",
    skills: "",
    portfolio: "",
  });
  const labels = {
    name: "Full name",
    title: "Professional title",
    summary: "Professional summary",
    experience: "Experience",
    education: "Education",
    skills: "Skills",
    portfolio: "Portfolio links",
  };
  return (
    <>
      <PageHeading
        title="Resume Builder"
        description="Bring your experience together with a live preview."
      />
      <p className="legal-note">
        <ShieldCheck className="inline mr-2" size={15} />
        Resume content is not saved or uploaded. Refreshing or leaving this page clears your
        entries.
      </p>
      <div className="editor-layout">
        <div className="form-stack">
          {(Object.keys(resume) as Array<keyof typeof resume>).map((key) => (
            <Field key={key} label={labels[key]}>
              {["summary", "experience", "education"].includes(key) ? (
                <textarea
                  value={resume[key]}
                  onChange={(e) => setResume((p) => ({ ...p, [key]: e.target.value }))}
                />
              ) : (
                <input
                  value={resume[key]}
                  onChange={(e) => setResume((p) => ({ ...p, [key]: e.target.value }))}
                />
              )}
            </Field>
          ))}
          <AIRequired />
          <Button disabled className="resume-ai-action">
            <Sparkles />
            Enhance with AI — not connected
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              setResume({
                name: "",
                title: "",
                summary: "",
                experience: "",
                education: "",
                skills: "",
                portfolio: "",
              })
            }
          >
            <RotateCcw />
            Clear resume
          </Button>
        </div>
        <div>
          <p className="preview-label">LIVE RESUME PREVIEW · NOT SAVED</p>
          <article className="resume-preview">
            <h2>{resume.name || "Your name"}</h2>
            <p className="resume-title">{resume.title || "Your professional title"}</p>
            {(["summary", "experience", "education", "skills", "portfolio"] as const).map((key) => (
              <section key={key}>
                <h3>{labels[key]}</h3>
                <p>{resume[key] || "—"}</p>
              </section>
            ))}
          </article>
        </div>
      </div>
    </>
  );
}
