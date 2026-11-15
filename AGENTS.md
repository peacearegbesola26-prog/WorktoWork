<!-- LOVABLE:BEGIN -->

> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.

<!-- LOVABLE:END -->

## Application architecture

- Use only Cloud-owned account records in the application; never import legacy browser sample state or seed fictional opportunities.
- Put real workspace pages under /app within the authenticated layout; preserve old addresses with redirects rather than a second experience.
- Persist resumes through owner-scoped authenticated commands and RLS; keep unsaved edits in memory with an explicit status so drafts never enter browser storage.
- Keep resume AI prompts and gateway helpers server-only; fetch owner resumes before processing, return reviewable suggestions without overwriting facts, and persist terminal provider denials to prevent repeated blocked requests.
- Express the visual system in semantic global CSS tokens and use the shared Button for actions to keep styling and focus behavior consistent.
- Keep source connector contracts separate from pages and without live adapters until permitted integrations are configured.
- Put real workspace pages under the authenticated route layout and enforce ownership in RLS and authenticated server functions, because navigation alone is not an access boundary.
- Store roles separately from profiles with no client role writes; initial administrator assignment requires a trusted project-owner operation.
- Staff permissions use database helpers and owner-only role commands with serialized last-owner safeguards; staff never inherit private document ownership.
- Suspensions use restrictive database policies and composed active-account middleware on private commands; staff user lists project only account metadata and activity counts, never private documents or notes.
- Resume AI requests reserve a durable per-user daily slot before calling the unchanged gateway, enforcing administration availability and input limits without logging resume content.
- Defer router and query invalidation outside auth event callbacks so session checks cannot deadlock the auth lock.
- Keep account query options and navigation validation separate from React component exports for stable refresh behavior.
- Preserve validated intended destinations in account links and verification callbacks so changing account forms does not lose the protected destination.
- Save settings with a preferences-only command so stale hidden profile fields cannot overwrite newer profile edits.
- Live production verification must never create fictional opportunities; test save rejection and constraints without populating discovery.
- Administration uses a separate client-only staff layout at /admin with dedicated login and permission-scoped navigation; every callable handler and database policy rechecks active permissions so existing sessions cannot bypass revocation.
- Opportunity lifecycle and audit history are enforced by database triggers; search is paginated against active database rows, never a limited browser sample.
