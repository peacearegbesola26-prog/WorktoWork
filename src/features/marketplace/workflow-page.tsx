import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { MessageSquare, Paperclip, Plus, Send, Trash2, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState, Field, PageHeading } from "@/components/work/shared";
import { supabase } from "@/integrations/supabase/client";
import { money } from "@/features/jobs/schemas";
import { marketplaceOptions } from "./workflow-query";
import { useMarketplaceLive } from "./workflow-live";
import { createOffer, markConversationRead, markNotification, openConversation, respondOffer, sendMessage } from "./workflow.functions";
import { canDeliver, offerSchema } from "./workflow-schema";

type Marketplace = Awaited<ReturnType<typeof marketplaceOptions.queryFn>>;
const errorText = (e: unknown) => e instanceof Error ? e.message : "Please try again.";

export function ConversationAction({ application }: { application: string }) {
  const client = useQueryClient();
  const open = useServerFn(openConversation);
  const mutation = useMutation({ mutationFn: () => open({ data: application }), onSuccess: async id => {
    await client.invalidateQueries({ queryKey: marketplaceOptions.queryKey });
    window.location.assign(`/app/messages?conversation=${encodeURIComponent(id)}`);
  }});
  return <><Button size="sm" variant="outline" disabled={mutation.isPending} onClick={() => mutation.mutate()}><MessageSquare size={15} />Message</Button>{mutation.error && <p role="alert" className="error-inline">{errorText(mutation.error)}</p>}</>;
}

export function MarketplaceBadge() {
  const { data } = useSuspenseQuery(marketplaceOptions);
  useMarketplaceLive();
  const unread = data.notifications.filter(n => !n.read_at).length;
  return <Button variant="ghost" size="sm" asChild><Link to="/app/notifications" aria-label={`Notifications, ${unread} unread`}><Bell size={18} />{unread > 0 && <span>{unread}</span>}</Link></Button>;
}

export function MessagesPage({ initialConversation = "" }: { initialConversation?: string }) {
  const { data } = useSuspenseQuery(marketplaceOptions);
  useMarketplaceLive();
  const client = useQueryClient();
  const [selected, setSelected] = useState(initialConversation);
  const conversation = data.conversations.find(c => c.id === selected);
  const mark = useServerFn(markConversationRead);
  const read = useMutation({ mutationFn: mark, onSuccess: () => client.invalidateQueries({ queryKey: marketplaceOptions.queryKey }) });
  const messages = data.messages.filter(m => m.conversation_id === selected);
  const last = messages.at(-1)?.created_at;
  const readThrough = data.reads.find(r => r.conversation_id === selected)?.read_at;
  useEffect(() => {
    if (conversation && last && (!readThrough || last > readThrough)) read.mutate({ data: { conversation: selected, through: last } });
  }, [selected, last, readThrough, conversation?.id]);
  const eligible = data.applications.filter(a => !data.conversations.some(c => c.application_id === a.id));
  return <>
    <PageHeading title="Messages" description="Your private project conversations." />
    {initialConversation && !conversation && <p role="alert" className="error-inline">Conversation unavailable. Only its participants can open it.</p>}
    {data.conversations.length === 0 && eligible.length === 0 ? <EmptyState title="No conversations yet" description="Conversations become available when a seller applies to your job, or you apply to a buyer’s job." /> :
      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="min-w-0 space-y-3">
          {data.conversations.map(c => {
            const seen = data.reads.find(r => r.conversation_id === c.id)?.read_at ?? "";
            const unread = data.messages.filter(m => m.conversation_id === c.id && m.sender_id !== data.userId && m.created_at > seen).length;
            return <Button key={c.id} variant={selected === c.id ? "secondary" : "outline"} className="h-auto w-full justify-start whitespace-normal text-left" onClick={() => setSelected(c.id)}>{c.title}{unread > 0 && <span className="status-pill">{unread} unread</span>}</Button>;
          })}
          {eligible.length > 0 && <h2>Start a conversation</h2>}
          {eligible.map(a => <div key={a.id}><p>{a.jobs?.title ?? "Application"} · {a.seller_name || "Seller"}</p><ConversationAction application={a.id} /></div>)}
        </aside>
        {conversation ? <Conversation key={conversation.id} data={data} conversation={conversation} /> : <EmptyState title="Select a conversation" description="Your messages will appear here." />}
      </div>}
  </>;
}

function Conversation({ data, conversation }: { data: Marketplace; conversation: Marketplace["conversations"][number] }) {
  const client = useQueryClient();
  const send = useServerFn(sendMessage);
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [localError, setLocalError] = useState("");
  const request = useRef<{ id: string; body: string; path: string | null; name: string | null } | null>(null);
  const upload = useRef<HTMLInputElement | null>(null);
  const messages = data.messages.filter(m => m.conversation_id === conversation.id);
  const end = useRef<HTMLDivElement | null>(null);
  useEffect(() => { end.current?.scrollIntoView({ block: "nearest", behavior: "instant" }); }, [messages.length]);
  const mutation = useMutation({ mutationFn: async () => {
    if (!text.trim()) throw new Error("Write a message before sending.");
    if (file && file.size > 10 * 1024 * 1024) throw new Error("Choose a file smaller than 10 MB.");
    if (!request.current) request.current = { id: crypto.randomUUID(), body: text.trim(), path: null, name: file?.name ?? null };
    const pending = request.current;
    if (file && !pending.path) {
      const path = `${conversation.id}/${data.userId}/${pending.id}`;
      const r = await supabase.storage.from("marketplace-files").upload(path, file, { upsert: false, contentType: "application/octet-stream" });
      if (r.error && r.error.message !== "The resource already exists") throw new Error("Attachment upload failed. Your message and file are kept for retry.");
      pending.path = path;
    }
    return send({ data: { conversation: conversation.id, request: pending.id, body: pending.body, attachment: pending.path, name: pending.name } });
  }, onSuccess: async () => {
    request.current = null; setText(""); setFile(null); if (upload.current) upload.current.value = "";
    await client.invalidateQueries({ queryKey: marketplaceOptions.queryKey });
  }});
  const pending = mutation.isPending;
  return <section className="min-w-0">
    <h2>{conversation.title}</h2>
    <div className="max-h-[520px] min-h-48 space-y-4 overflow-y-auto border-y border-border py-4" aria-label="Conversation messages" aria-live="polite">
      {messages.length === 0 && <p>No messages yet.</p>}
      {messages.map(m => <article key={m.id} className={`max-w-[85%] break-words ${m.sender_id === data.userId ? "ml-auto text-right" : "mr-auto"}`}>
        <small className="text-muted-foreground">{m.sender_id === data.userId ? "You" : "Project participant"} · {new Date(m.created_at).toLocaleString()}</small>
        <p className="whitespace-pre-wrap">{m.body}</p>
        {m.attachment_path && <Button variant="link" size="sm" onClick={async () => {
          const r = await supabase.storage.from("marketplace-files").download(m.attachment_path ?? "");
          if (r.error || !r.data) { setLocalError("Attachment could not be downloaded. Please try again."); return; }
          const url = URL.createObjectURL(r.data); const a = document.createElement("a"); a.href = url; a.download = m.attachment_name ?? "attachment"; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
        }}><Paperclip size={14} />{m.attachment_name ?? "Download attachment"}</Button>}
      </article>)}<div ref={end} />
    </div>
    <form className="form-stack mt-4" onSubmit={e => { e.preventDefault(); setLocalError(""); mutation.mutate(); }}>
      <Field label="Message"><textarea rows={3} maxLength={4000} value={text} disabled={pending || !!request.current} onChange={e => setText(e.target.value)} /></Field>
      <Field label="Attachment"><input ref={upload} type="file" disabled={pending || !!request.current} onChange={e => setFile(e.target.files?.[0] ?? null)} /></Field>
      {(mutation.error || localError) && <p role="alert" className="error-inline">{localError || errorText(mutation.error)}</p>}
      <Button type="submit" disabled={pending || !text.trim()}><Send size={16} />{pending ? "Sending…" : "Send message"}</Button>
    </form>
    <Button asChild variant="link"><Link to="/app/contracts" search={{ conversation: conversation.id }}>Offers and milestones</Link></Button>
  </section>;
}

export function ContractsPage({ initialConversation = "", deliveries = false }: { initialConversation?: string; deliveries?: boolean }) {
  const { data } = useSuspenseQuery(marketplaceOptions);
  useMarketplaceLive();
  const [selected, setSelected] = useState(initialConversation || data.conversations[0]?.id || "");
  const client = useQueryClient(); const respond = useServerFn(respondOffer);
  const mutation = useMutation({ mutationFn: respond, onSuccess: () => client.invalidateQueries({ queryKey: marketplaceOptions.queryKey }) });
  const conversation = data.conversations.find(c => c.id === selected);
  return <>
    <PageHeading title={deliveries ? "Deliveries" : "Contracts and Milestones"} description={deliveries ? "Work submission awaits verified funding." : "Offers, agreed scope and milestones."} />
    <p className="integration-state">Payments Not connected. Acceptance does not fund or activate paid work. No money is held or released.</p>
    {mutation.error && <p role="alert" className="error-inline">{errorText(mutation.error)}</p>}
    {!deliveries && data.conversations.some(c => c.buyer_id === data.userId) && <>
      <Field label="Offer conversation"><select value={selected} onChange={e => setSelected(e.target.value)}><option value="">Choose conversation</option>{data.conversations.filter(c => c.buyer_id === data.userId).map(c => <option key={c.id} value={c.id}>{c.title}</option>)}</select></Field>
      {conversation?.buyer_id === data.userId && !data.contracts.some(c => c.conversation_id === selected) && <OfferForm key={selected} conversation={selected} />}
    </>}
    {data.contracts.length === 0 ? <EmptyState title="No offers yet" description="Start a conversation from an eligible application before agreeing an offer." /> : <div className="space-y-6">
      {data.contracts.map(c => <article key={c.id} className="border-b border-border py-5">
        <h2>{c.title}</h2><p><span className="status-pill">{c.status === "accepted_unfunded" ? "Accepted · Not funded" : c.status}</span> · {money(c.amount, c.currency)}</p>
        <p className="whitespace-pre-wrap">{c.terms}</p>
        <ul className="space-y-2 py-3">{data.milestones.filter(m => m.contract_id === c.id).map(m => <li key={m.id}>{m.title} · {money(m.amount, c.currency)}{m.due_date ? ` · Due ${m.due_date}` : ""} · Not funded</li>)}</ul>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline"><Link to="/app/messages" search={{ conversation: c.conversation_id }}>Conversation</Link></Button>
          {!deliveries && c.status === "offered" && c.seller_id === data.userId && <><Button disabled={mutation.isPending} onClick={() => mutation.mutate({ data: { contract: c.id, action: "accept" } })}>Accept offer</Button><Button variant="outline" disabled={mutation.isPending} onClick={() => mutation.mutate({ data: { contract: c.id, action: "decline" } })}>Decline</Button></>}
          {!deliveries && ["offered", "accepted_unfunded"].includes(c.status) && c.buyer_id === data.userId && <Button variant="outline" disabled={mutation.isPending} onClick={() => mutation.mutate({ data: { contract: c.id, action: "cancel" } })}>Cancel unfunded offer</Button>}
          {deliveries && <><Button disabled={!canDeliver(c.status)}>Submit delivery</Button><Button disabled>Request revision</Button><Button disabled>Approve delivery</Button></>}
        </div>{deliveries && <p className="legal-note">Funding required. Delivery, revision and approval actions stay disabled until real funding is available.</p>}
      </article>)}
    </div>}
  </>;
}

function OfferForm({ conversation }: { conversation: string }) {
  const [terms, setTerms] = useState("");
  const [milestones, setMilestones] = useState([{ title: "", amount: "", due_date: "" }]);
  const [error, setError] = useState(""); const client = useQueryClient(); const send = useServerFn(createOffer);
  const mutation = useMutation({ mutationFn: send, onSuccess: () => client.invalidateQueries({ queryKey: marketplaceOptions.queryKey }) });
  return <form className="form-stack my-6 max-w-3xl" onSubmit={e => {
    e.preventDefault(); const parsed = offerSchema.safeParse({ conversation, terms, milestones: milestones.map(m => ({ ...m, amount: Number(m.amount) })) });
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? "Check the offer."); return; }
    setError(""); mutation.mutate({ data: parsed.data });
  }}>
    <h2>Send an offer</h2><Field label="Offer terms"><textarea rows={5} value={terms} onChange={e => setTerms(e.target.value)} /></Field>
    {milestones.map((m, i) => <div key={i} className="grid gap-3 sm:grid-cols-3">
      <Field label={`Milestone ${i + 1} title`}><input value={m.title} onChange={e => setMilestones(old => old.map((x, j) => j === i ? { ...x, title: e.target.value } : x))} /></Field>
      <Field label={`Milestone ${i + 1} amount`}><input type="number" min="0.01" step="0.01" value={m.amount} onChange={e => setMilestones(old => old.map((x, j) => j === i ? { ...x, amount: e.target.value } : x))} /></Field>
      <Field label={`Milestone ${i + 1} due date`}><input type="date" value={m.due_date} onChange={e => setMilestones(old => old.map((x, j) => j === i ? { ...x, due_date: e.target.value } : x))} /></Field>
      {milestones.length > 1 && <Button type="button" variant="ghost" size="icon" title="Remove milestone" onClick={() => setMilestones(old => old.filter((_, j) => j !== i))}><Trash2 size={16} /></Button>}
    </div>)}
    <div className="flex gap-3"><Button type="button" variant="outline" disabled={milestones.length >= 20} onClick={() => setMilestones(old => [...old, { title: "", amount: "", due_date: "" }])}><Plus size={16} />Add milestone</Button><Button disabled={mutation.isPending} type="submit">{mutation.isPending ? "Sending…" : "Send offer"}</Button></div>
    {(error || mutation.error) && <p className="error-inline" role="alert">{error || errorText(mutation.error)}</p>}
  </form>;
}

const notificationTitle: Record<string, string> = {
  message: "New message",
  offer: "New offer",
  accepted: "Offer accepted",
  declined: "Offer declined",
  cancelled: "Offer cancelled",
};

export function NotificationsPage() {
  const { data } = useSuspenseQuery(marketplaceOptions); useMarketplaceLive();
  const client = useQueryClient(); const mark = useServerFn(markNotification);
  const mutation = useMutation({ mutationFn: mark, onSuccess: () => client.invalidateQueries({ queryKey: marketplaceOptions.queryKey }) });
  return <><PageHeading title="Notifications" description="Updates from your project conversations and offers." />
    {mutation.error && <p role="alert" className="error-inline">{errorText(mutation.error)}</p>}
    {!data.notifications.length ? <EmptyState title="No notifications yet" description="New messages and offer updates appear here." /> : data.notifications.map(n => <article key={n.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-border py-4">
      <div><strong>{notificationTitle[n.kind] ?? "Update"}</strong><p>{data.conversations.find(c => c.id === n.conversation_id)?.title}</p><small>{new Date(n.created_at).toLocaleString()}</small></div>
      <div className="flex gap-2"><Button asChild variant="outline">{n.kind === "message" ? <Link to="/app/messages" search={{ conversation: n.conversation_id }}>Open conversation</Link> : <Link to="/app/contracts" search={{ conversation: n.conversation_id }}>View offer</Link>}</Button>{!n.read_at && <Button variant="ghost" disabled={mutation.isPending} onClick={() => mutation.mutate({ data: n.id })}>Mark read</Button>}</div>
    </article>)}
  </>;
}