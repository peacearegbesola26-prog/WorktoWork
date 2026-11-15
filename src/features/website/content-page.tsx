import { useState } from "react";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowUp, ArrowDown, Trash2, Plus, Eye, Save, Upload, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, PageHeading, PublicShell } from "@/components/work/shared";
import { Landing } from "@/components/work/landing";
import { Contact, HowItWorks, Pricing } from "@/components/work/public-pages";
import { websiteEditorOptions } from "./query";
import { saveWebsitePage } from "./website.functions";
import { pageKeys, pageSchema, type WebsitePage } from "./schema";
import { WebsiteProvider } from "./context";
import { ManagedPublicPage } from "./managed-page";
const labels = {
  home: "Homepage",
  public: "How It Works",
  footer: "Footer and navigation",
  contact: "Contact",
  pricing: "Pricing",
  about: "About",
  privacy: "Privacy policy",
  terms: "Terms",
  faqs: "FAQs",
};
export function ContentEditor() {
  const { data } = useSuspenseQuery(websiteEditorOptions);
  const client = useQueryClient();
  const save = useServerFn(saveWebsitePage);
  const [key, setKey] = useState<(typeof pageKeys)[number]>("home");
  const row = data.pages.find((p) => p.key === key);
  const [edited, setEdited] = useState<WebsitePage | null>(null);
  const [preview, setPreview] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  if (!row) return <p>No page found.</p>;
  const value = edited ?? row.draft;
  const update = (patch: Partial<WebsitePage>) => {
    setEdited({ ...value, ...patch });
    setStatus("Unsaved changes");
  };
  async function command(action: "draft" | "publish" | "restore", version?: string) {
    if (!row) return;
    setBusy(true);
    setError("");
    try {
      const content = pageSchema.parse(value);
      await save({ data: { key, content, action, revision: row.revision, version } });
      await client.invalidateQueries({ queryKey: ["website-editor"] });
      await client.invalidateQueries({ queryKey: ["published-website"] });
      setEdited(null);
      setStatus(
        action === "draft"
          ? "Draft saved"
          : action === "restore"
            ? "Previous version restored"
            : "Content published",
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setBusy(false);
    }
  }
  const iconButton = (name: string, icon: React.ReactNode, fn: () => void) => (
    <Button type="button" variant="outline" size="icon" aria-label={name} title={name} onClick={fn}>
      {icon}
    </Button>
  );
  return (
    <>
      <PageHeading title="Website content" description="Published pages and private drafts." />
      <Field label="Page">
        <select
          value={key}
          onChange={(e) => {
            if (edited && !window.confirm("Discard unsaved changes?")) return;
            setKey(e.target.value as typeof key);
            setEdited(null);
            setPreview(false);
            setError("");
            setStatus("");
          }}
        >
          {pageKeys.map((k) => (
            <option value={k} key={k}>
              {labels[k]}
            </option>
          ))}
        </select>
      </Field>
      <div className="flex flex-wrap gap-2 my-5">
        <Button disabled={busy} onClick={() => command("draft")}>
          <Save />
          Save draft
        </Button>
        <Button variant="outline" onClick={() => setPreview(!preview)}>
          <Eye />
          {preview ? "Close preview" : "Preview draft"}
        </Button>
        <Button
          disabled={busy}
          onClick={() => {
            if (window.confirm("Publish this content to the website?")) void command("publish");
          }}
        >
          <Upload />
          Publish content
        </Button>
      </div>
      {error && (
        <p role="alert" className="error-inline">
          {error}
        </p>
      )}
      {status && <p role="status">{status}</p>}
      {preview ? (
        <div className="border border-border mt-5">
          <WebsiteProvider
            override={{
              pages: Object.fromEntries(
                data.pages.map((p) => [p.key, p.key === key ? value : p.published]),
              ),
              settings: data.settings,
            }}
          >
            {key === "home" ? (
              <Landing />
            ) : key === "public" ? (
              <HowItWorks />
            ) : key === "contact" ? (
              <Contact />
            ) : key === "pricing" ? (
              <Pricing />
            ) : key === "footer" ? (
              <PublicShell>
                <div className="site-container py-10">
                  <h1>Footer preview</h1>
                </div>
              </PublicShell>
            ) : (
              <ManagedPublicPage page={key} />
            )}
          </WebsiteProvider>
        </div>
      ) : (
        <div className="form-stack max-w-3xl">
          <h2 className="text-xl">Search and sharing</h2>
          <Field label="SEO title">
            <input
              value={value.title}
              maxLength={150}
              onChange={(e) => update({ title: e.target.value })}
            />
          </Field>
          <Field label="SEO description">
            <textarea
              value={value.description}
              maxLength={500}
              onChange={(e) => update({ description: e.target.value })}
            />
          </Field>
          <h2 className="text-xl">Page wording</h2>
          {Object.entries(value.text).map(([id, text]) => (
            <Field
              key={id}
              label={
                id === "body"
                  ? "Page content"
                  : `Field ${id} · ${row.published.text[id]?.slice(0, 70) ?? id}`
              }
            >
              <textarea
                value={text}
                onChange={(e) => update({ text: { ...value.text, [id]: e.target.value } })}
              />
            </Field>
          ))}
          {key === "home" && (
            <>
              <Field label="Primary call to action URL">
                <input
                  value={value.primaryCta}
                  onChange={(e) => update({ primaryCta: e.target.value })}
                />
              </Field>
              <Field label="Secondary call to action URL">
                <input
                  value={value.secondaryCta}
                  onChange={(e) => update({ secondaryCta: e.target.value })}
                />
              </Field>
            </>
          )}
          {key === "faqs" && (
            <>
              <h2 className="text-xl">Frequently asked questions</h2>
              {value.faqs.map((f, i) => (
                <div className="border-b border-border pb-5" key={i}>
                  <Field label={`Question ${i + 1}`}>
                    <input
                      value={f.question}
                      onChange={(e) =>
                        update({
                          faqs: value.faqs.map((x, j) =>
                            j === i ? { ...x, question: e.target.value } : x,
                          ),
                        })
                      }
                    />
                  </Field>
                  <Field label="Answer">
                    <textarea
                      value={f.answer}
                      onChange={(e) =>
                        update({
                          faqs: value.faqs.map((x, j) =>
                            j === i ? { ...x, answer: e.target.value } : x,
                          ),
                        })
                      }
                    />
                  </Field>
                  <div className="flex gap-2">
                    {iconButton("Move question up", <ArrowUp />, () => {
                      if (i === 0) return;
                      const list = [...value.faqs];
                      const item = list.splice(i, 1)[0];
                      if (item) list.splice(i - 1, 0, item);
                      update({ faqs: list });
                    })}
                    {iconButton("Move question down", <ArrowDown />, () => {
                      const list = [...value.faqs];
                      const item = list.splice(i, 1)[0];
                      if (item) list.splice(i + 1, 0, item);
                      update({ faqs: list });
                    })}
                    {iconButton("Delete question", <Trash2 />, () =>
                      update({ faqs: value.faqs.filter((_, j) => j !== i) }),
                    )}
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() => update({ faqs: [...value.faqs, { question: "", answer: "" }] })}
              >
                <Plus />
                Add question
              </Button>
            </>
          )}
          {key === "footer" && (
            <>
              <h2 className="text-xl">Social and footer links</h2>
              {value.links.map((l, i) => (
                <div className="flex flex-wrap gap-3 items-end" key={i}>
                  <Field label="Link label">
                    <input
                      value={l.label}
                      onChange={(e) =>
                        update({
                          links: value.links.map((x, j) =>
                            j === i ? { ...x, label: e.target.value } : x,
                          ),
                        })
                      }
                    />
                  </Field>
                  <Field label="URL">
                    <input
                      value={l.url}
                      onChange={(e) =>
                        update({
                          links: value.links.map((x, j) =>
                            j === i ? { ...x, url: e.target.value } : x,
                          ),
                        })
                      }
                    />
                  </Field>
                  {iconButton("Remove link", <Trash2 />, () =>
                    update({ links: value.links.filter((_, j) => j !== i) }),
                  )}
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() => update({ links: [...value.links, { label: "", url: "" }] })}
              >
                <Plus />
                Add link
              </Button>
            </>
          )}
        </div>
      )}
      <section className="mt-10 border-t border-border pt-6">
        <h2 className="text-xl mb-4">Published versions</h2>
        {data.versions
          .filter((v) => v.key === key)
          .map((v) => (
            <div
              className="flex flex-wrap gap-4 items-center justify-between border-b border-border py-3"
              key={v.id}
            >
              <span>
                Version {v.revision} · {new Date(v.created_at).toLocaleString()}
              </span>
              <Button
                variant="outline"
                disabled={busy}
                onClick={() => {
                  if (window.confirm("Restore this version on the website?"))
                    void command("restore", v.id);
                }}
              >
                <RotateCcw />
                Restore version {v.revision}
              </Button>
            </div>
          ))}
      </section>
    </>
  );
}
