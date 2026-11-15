import { useState } from "react";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { Plus, Save, Copy, Trash2, Printer, Sparkles, Check, FileText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, PageHeading, EmptyState } from "@/components/work/shared";
import { resumesOptions } from "./query";
import { resumeCommand, optimizeResume } from "./resumes.functions";
import {
  blankResume,
  labels,
  missingInput,
  type ResumeContent,
  type OptimizationMode,
} from "./schema";
type Resume = Awaited<ReturnType<typeof import("./resumes.functions").listResumes>>[number];
export function ResumePage({ optimizer = false }: { optimizer?: boolean }) {
  const { data: resumes } = useSuspenseQuery(resumesOptions);
  const [selected, setSelected] = useState<string | null>(null);
  const [draft, setDraft] = useState(false);
  const current = resumes.find((r) => r.id === selected) ?? (selected ? undefined : resumes[0]);
  return (
    <>
      <PageHeading
        title={optimizer ? "Resume Optimizer" : "Resume Builder"}
        description={
          optimizer
            ? "Refine your story, without changing your facts."
            : "Your experience. Your next chapter."
        }
        action={
          !optimizer && (
            <Button
              onClick={() => {
                setDraft(true);
                setSelected(null);
              }}
            >
              <Plus />
              New resume
            </Button>
          )
        }
      />
      {resumes.length > 0 && (
        <div className="resume-picker no-print">
          <Field label="Saved resume">
            <select
              value={draft ? "" : (current?.id ?? "")}
              onChange={(e) => {
                if (draft && !window.confirm("Discard the unsaved draft?")) return;
                setDraft(false);
                setSelected(e.target.value);
              }}
            >
              <option value="" disabled>
                Select a resume
              </option>
              {resumes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </Field>
        </div>
      )}
      {draft || current ? (
        <ResumeEditor
          key={draft ? "new" : current?.id}
          resume={draft ? undefined : current}
          optimizer={optimizer}
          onSaved={(id) => {
            setDraft(false);
            setSelected(id);
          }}
          onDeleted={() => {
            setDraft(false);
            setSelected(null);
          }}
        />
      ) : (
        <EmptyState
          title="No saved resumes yet"
          description="Your saved resumes will appear here."
          action={
            optimizer ? (
              <Button asChild>
                <Link to="/app/resume-builder">
                  <FileText />
                  Create a resume
                </Link>
              </Button>
            ) : (
              <Button onClick={() => setDraft(true)}>
                <Plus />
                Create a resume
              </Button>
            )
          }
        />
      )}
    </>
  );
}
function ResumeEditor({
  resume,
  optimizer,
  onSaved,
  onDeleted,
}: {
  resume: Resume | undefined;
  optimizer: boolean;
  onSaved: (id: string) => void;
  onDeleted: () => void;
}) {
  const [content, setContent] = useState<ResumeContent>(resume?.content ?? { ...blankResume });
  const [name, setName] = useState(resume?.name ?? "Untitled resume");
  const [dirty, setDirty] = useState(!resume);
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<OptimizationMode>("summary");
  const [suggestion, setSuggestion] = useState("");
  const [canApply, setCanApply] = useState(false);
  const [error, setError] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const command = useServerFn(resumeCommand);
  const optimize = useServerFn(optimizeResume);
  const query = useQueryClient();
  async function save() {
    if (!name.trim()) {
      toast.error("Give your resume a name.");
      return;
    }
    setBusy(true);
    try {
      const result = await command({ data: { action: "save", id: resume?.id, name, content } });
      await query.invalidateQueries({ queryKey: resumesOptions.queryKey });
      setDirty(false);
      onSaved(result.id);
      toast.success("Resume saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Resume could not be saved.");
    } finally {
      setBusy(false);
    }
  }
  async function act(action: "duplicate" | "delete") {
    if (!resume) return;
    if (action === "delete" && !window.confirm(`Delete “${resume.name}”? This cannot be undone.`))
      return;
    if (
      action === "duplicate" &&
      dirty &&
      !window.confirm("Duplicate the last saved version? Your unsaved edits are not included.")
    )
      return;
    setBusy(true);
    try {
      const result = await command({ data: { action, id: resume.id } });
      await query.invalidateQueries({ queryKey: resumesOptions.queryKey });
      action === "delete" ? onDeleted() : onSaved(result.id);
      toast.success(action === "delete" ? "Resume deleted" : "Resume duplicated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Action failed.");
    } finally {
      setBusy(false);
    }
  }
  async function requestAI() {
    if (!resume || dirty) return;
    const missing = missingInput(content, mode);
    if (missing) {
      setError(missing);
      return;
    }
    setAiBusy(true);
    setError("");
    setSuggestion("");
    try {
      const result = await optimize({ data: { id: resume.id, mode } });
      setSuggestion(result.text);
      setCanApply("canApply" in result && result.canApply === true);
      setError(result.error ?? "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "AI could not complete this request.");
    } finally {
      setAiBusy(false);
    }
  }
  const edit = (key: keyof ResumeContent, value: string) => {
    setContent((c) => ({ ...c, [key]: value }));
    setDirty(true);
    setSuggestion("");
  };
  return (
    <div className="resume-workspace">
      <div className="resume-toolbar no-print">
        <p role="status" className="legal-note">
          {dirty ? "Unsaved changes — save before leaving." : "Saved to your private account."}
        </p>
        <div className="resume-actions">
          <Button disabled={busy || aiBusy || !dirty} onClick={save}>
            <Save />
            {busy ? "Saving…" : "Save resume"}
          </Button>
          <Button variant="outline" onClick={() => window.print()}>
            <Printer />
            Print / Save as PDF
          </Button>
          {resume && (
            <>
              <Button
                variant="outline"
                size="icon"
                title="Duplicate saved resume"
                aria-label="Duplicate resume"
                disabled={busy || aiBusy}
                onClick={() => act("duplicate")}
              >
                <Copy />
              </Button>
              <Button
                variant="outline"
                size="icon"
                title="Delete resume"
                aria-label="Delete resume"
                disabled={busy || aiBusy}
                onClick={() => act("delete")}
              >
                <Trash2 />
              </Button>
            </>
          )}
        </div>
      </div>
      <div className="editor-layout">
        <div className="form-stack no-print">
          <Field label="Resume name">
            <input
              aria-label="Resume name"
              maxLength={200}
              disabled={aiBusy}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setDirty(true);
              }}
            />
          </Field>
          {!optimizer &&
            (Object.keys(labels) as (keyof ResumeContent)[]).map((key) => (
              <Field key={key} label={labels[key]}>
                {[
                  "summary",
                  "experience",
                  "education",
                  "skills",
                  "certifications",
                  "projects",
                  "portfolio",
                ].includes(key) ? (
                  <textarea
                    aria-label={labels[key]}
                    disabled={aiBusy}
                    maxLength={15000}
                    value={content[key]}
                    onChange={(e) => edit(key, e.target.value)}
                  />
                ) : (
                  <input
                    aria-label={labels[key]}
                    disabled={aiBusy}
                    maxLength={15000}
                    value={content[key]}
                    onChange={(e) => edit(key, e.target.value)}
                  />
                )}
              </Field>
            ))}
          <section className="resume-ai-panel">
            <h2>
              <Sparkles size={18} /> AI suggestions
            </h2>
            <Field label="Request">
              <select
                disabled={aiBusy}
                value={mode}
                onChange={(e) => {
                  setMode(e.target.value as OptimizationMode);
                  setSuggestion("");
                  setError("");
                }}
              >
                <option value="summary">Professional summary improvements</option>
                <option value="experience">Clearer experience descriptions</option>
                <option value="achievements">Stronger achievement wording</option>
                <option value="feedback">Overall resume feedback</option>
              </select>
            </Field>
            <p className="legal-note">
              Your saved resume is sent to Lovable AI only when you request a suggestion. Review
              every claim before applying.
            </p>
            {dirty && (
              <p className="legal-note">Save your changes before requesting AI suggestions.</p>
            )}
            <Button
              className="resume-ai-action"
              disabled={!resume || dirty || busy || aiBusy}
              onClick={requestAI}
            >
              <Sparkles />
              {aiBusy ? "Reviewing your resume…" : "Request suggestion"}
            </Button>
            {error && (
              <p role="alert" className="text-destructive">
                {error}
              </p>
            )}
            {suggestion && (
              <div className="resume-suggestion">
                <h3>
                  {canApply ? "Suggested wording · review required" : "Feedback and questions"}
                </h3>
                <p>{suggestion}</p>
                {canApply && mode !== "feedback" && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      const field = mode === "summary" ? "summary" : "experience";
                      setContent((c) => ({ ...c, [field]: suggestion }));
                      setDirty(true);
                      setSuggestion("");
                    }}
                  >
                    <Check />
                    Apply to draft
                  </Button>
                )}
              </div>
            )}
            {optimizer && (
              <Button asChild variant="outline">
                <Link to="/app/resume-builder">Edit resume</Link>
              </Button>
            )}
          </section>
        </div>
        <div className="resume-preview-column">
          <p className="preview-label no-print">
            LIVE RESUME PREVIEW {dirty ? "· UNSAVED" : "· SAVED"}
          </p>
          <article className="resume-preview print-resume" aria-label="Resume preview">
            <h2>{content.fullName || "Your name"}</h2>
            {content.title && <p className="resume-title">{content.title}</p>}
            <p className="resume-contact">
              {[content.email, content.phone, content.location].filter(Boolean).join(" · ")}
            </p>
            {(
              [
                "summary",
                "experience",
                "education",
                "skills",
                "certifications",
                "projects",
                "portfolio",
              ] as const
            ).map(
              (key) =>
                content[key] && (
                  <section key={key}>
                    <h3>{labels[key]}</h3>
                    <p>{content[key]}</p>
                  </section>
                ),
            )}
          </article>
        </div>
      </div>
    </div>
  );
}
