import { PublicShell } from "@/components/work/shared";
import { useWebsite } from "./context";
export function ManagedPublicPage({ page }: { page: string }) {
  const content = useWebsite().pages[page];
  return (
    <PublicShell>
      <div className="site-container">
        <header className="public-page-head">
          <h1>{content?.title}</h1>
        </header>
        <section className="section narrow-content">
          <div className="whitespace-pre-wrap break-words">{content?.text["body"]}</div>
          {page === "faqs" &&
            (content?.faqs.length ? (
              content.faqs.map((f, i) => (
                <details className="border-b border-border py-5" key={i}>
                  <summary className="font-semibold cursor-pointer">{f.question}</summary>
                  <p className="whitespace-pre-wrap mt-3">{f.answer}</p>
                </details>
              ))
            ) : (
              <p>No frequently asked questions have been published yet.</p>
            ))}
        </section>
      </div>
    </PublicShell>
  );
}
