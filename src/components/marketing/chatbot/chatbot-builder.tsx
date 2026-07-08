"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRightLeft,
  Check,
  Copy,
  Database,
  Plus,
  RefreshCw,
  Save,
  Send,
  Settings2,
  Sparkles,
  Trash2,
  UserPlus,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import type {
  Chatbot,
  ChatbotCrmSync,
  ChatbotIntent,
  ChatbotKnowledgeSource,
  ChatbotWidget,
  ChatHandoffRule,
  ChatHandoffTrigger,
  ChatIntentAction,
  ChatLeadField,
  ChatbotSourceType,
} from "@/lib/types";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatRelative } from "@/lib/format";
import {
  createChatbotChildId,
  createChatbotId,
  useChatbotStore,
} from "@/lib/stores/chatbot-store";
import { cn } from "@/lib/utils";
import { ChatbotWidgetPreview } from "@/components/marketing/chatbot/chatbot-widget-preview";
import {
  HANDOFF_TRIGGER_LABELS,
  INTENT_ACTION_META,
  SOURCE_META,
  SOURCE_STATUS_STYLES,
} from "@/components/marketing/chatbot/chatbot-shared";

const TABS = [
  { value: "design", label: "Design & embed", icon: Sparkles },
  { value: "knowledge", label: "Knowledge base", icon: Database },
  { value: "flow", label: "Conversation flow", icon: Zap },
  { value: "handoff", label: "Handoff & routing", icon: ArrowRightLeft },
  { value: "crm", label: "CRM sync", icon: Settings2 },
] as const;

const DEFAULT_WIDGET: ChatbotWidget = {
  botName: "Ava",
  headerSubtitle: "Connect NX Assistant",
  themeColor: "#2563eb",
  launcher: "bottom-right",
  avatarInitials: "A",
  welcomeMessage: "Hi 👋 How can I help you today?",
  suggestedPrompts: ["What can you do?", "Book a demo"],
};
const DEFAULT_CRM: ChatbotCrmSync = { createContact: true, updateContact: true, logTranscript: true, lifecycleStage: "lead" };

export function ChatbotBuilder({ chatbotId }: { chatbotId?: string }) {
  const router = useRouter();
  const existing = useChatbotStore((s) => (chatbotId ? s.chatbots.find((b) => b.id === chatbotId) : undefined));
  const addChatbot = useChatbotStore((s) => s.addChatbot);
  const updateChatbot = useChatbotStore((s) => s.updateChatbot);

  const editMode = !!chatbotId;
  const [name, setName] = useState(existing?.name ?? "New chatbot");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [widget, setWidget] = useState<ChatbotWidget>(existing?.widget ?? DEFAULT_WIDGET);
  const [sources, setSources] = useState<ChatbotKnowledgeSource[]>(existing?.sources ?? []);
  const [intents, setIntents] = useState<ChatbotIntent[]>(existing?.intents ?? []);
  const [leadFields, setLeadFields] = useState<ChatLeadField[]>(existing?.leadFields ?? []);
  const [handoffRules, setHandoffRules] = useState<ChatHandoffRule[]>(existing?.handoffRules ?? []);
  const [crm, setCrm] = useState<ChatbotCrmSync>(existing?.crm ?? DEFAULT_CRM);
  const [tab, setTab] = useState<(typeof TABS)[number]["value"]>("design");
  const [copied, setCopied] = useState(false);

  const patchWidget = (p: Partial<ChatbotWidget>) => setWidget((w) => ({ ...w, ...p }));

  function save(activate: boolean) {
    if (!name.trim()) return toast.error("Give the chatbot a name");
    const now = new Date().toISOString();
    const shared = { name: name.trim(), description: description.trim() || undefined, widget, sources, intents, leadFields, handoffRules, crm };
    if (editMode && existing) {
      updateChatbot(existing.id, { ...shared, status: activate ? "active" : existing.status });
      toast.success(activate ? "Chatbot published" : "Changes saved");
      router.push(`/marketing/chatbot/${existing.id}`);
      return;
    }
    const bot: Chatbot = {
      id: createChatbotId(),
      ...shared,
      status: activate ? "active" : "draft",
      owner: "Priya Sharma",
      createdAt: now,
      updatedAt: now,
      conversations: 0, resolvedByBot: 0, leadsCaptured: 0, handoffs: 0, deflectionRate: 0,
    };
    addChatbot(bot);
    toast.success(activate ? "Chatbot published" : "Chatbot saved as draft");
    router.push(`/marketing/chatbot/${bot.id}`);
  }

  const embedCode = `<script>
  (function(){var s=document.createElement('script');
  s.src='https://cdn.connectnx.io/chat.js';
  s.setAttribute('data-bot','${existing?.id ?? "YOUR_BOT_ID"}');
  document.body.appendChild(s);})();
</script>`;

  if (editMode && !existing) {
    return (
      <EmptyState
        title="Chatbot not found"
        description="This chatbot may have been deleted."
        action={<Button variant="outline" onClick={() => router.push("/marketing/chatbot")}><ArrowLeft className="size-4" /> Back</Button>}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <Button variant="ghost" size="sm" className="-ml-2 text-muted-foreground" onClick={() => router.push("/marketing/chatbot")}>
            <ArrowLeft className="size-4" /> Chatbots
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight">{editMode ? `Edit ${existing?.name}` : "Build chatbot"}</h1>
          <p className="text-sm text-muted-foreground">Design the widget, train it, and control how it captures leads and hands off.</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="outline" onClick={() => save(false)}><Save className="size-4" /> Save draft</Button>
          <Button onClick={() => save(true)}><Zap className="size-4" /> {editMode ? "Save & publish" : "Publish"}</Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 border-b">
        {TABS.map((t) => (
          <button key={t.value} type="button" onClick={() => setTab(t.value)} className={cn("-mb-px flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium", tab === t.value ? "border-primary text-foreground" : "border-transparent text-muted-foreground")}>
            <t.icon className="size-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === "design" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <Card className="shadow-none">
              <CardHeader><CardTitle className="text-base">Chatbot</CardTitle></CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-2"><Label>Internal name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
                <div className="grid gap-2"><Label>Description</Label><Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Where does this bot run and what's its job?" /></div>
              </CardContent>
            </Card>
            <Card className="shadow-none">
              <CardHeader><CardTitle className="text-base">Widget appearance</CardTitle></CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2"><Label>Bot name</Label><Input value={widget.botName} onChange={(e) => patchWidget({ botName: e.target.value })} /></div>
                  <div className="grid gap-2"><Label>Avatar initials</Label><Input maxLength={2} value={widget.avatarInitials ?? ""} onChange={(e) => patchWidget({ avatarInitials: e.target.value })} /></div>
                </div>
                <div className="grid gap-2"><Label>Header subtitle</Label><Input value={widget.headerSubtitle ?? ""} onChange={(e) => patchWidget({ headerSubtitle: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label>Theme color</Label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={widget.themeColor} onChange={(e) => patchWidget({ themeColor: e.target.value })} className="size-8 cursor-pointer rounded border" />
                      <Input value={widget.themeColor} onChange={(e) => patchWidget({ themeColor: e.target.value })} className="w-28" />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Launcher position</Label>
                    <Select value={widget.launcher} onValueChange={(v) => patchWidget({ launcher: (v as ChatbotWidget["launcher"]) ?? "bottom-right" })}>
                      <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bottom-right">Bottom right</SelectItem>
                        <SelectItem value="bottom-left">Bottom left</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2"><Label>Welcome message</Label><Textarea rows={2} value={widget.welcomeMessage} onChange={(e) => patchWidget({ welcomeMessage: e.target.value })} /></div>
                <div className="grid gap-2">
                  <Label>Suggested prompts</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {widget.suggestedPrompts.map((p, i) => (
                      <span key={i} className="flex items-center gap-1 rounded-full border bg-muted/50 py-1 pr-1 pl-2.5 text-xs">
                        {p}
                        <button type="button" onClick={() => patchWidget({ suggestedPrompts: widget.suggestedPrompts.filter((_, j) => j !== i) })} className="flex size-4 items-center justify-center rounded-full hover:bg-muted"><X className="size-3" /></button>
                      </span>
                    ))}
                  </div>
                  <PromptAdder onAdd={(v) => patchWidget({ suggestedPrompts: [...widget.suggestedPrompts, v] })} />
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-none">
              <CardHeader><CardTitle className="text-base">Install</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">Paste this snippet before <code className="rounded bg-muted px-1 text-xs">&lt;/body&gt;</code> on any page.</p>
                <div className="relative">
                  <pre className="overflow-x-auto rounded-lg bg-muted/60 p-3 font-mono text-[11px] leading-relaxed text-muted-foreground">{embedCode}</pre>
                  <Button variant="outline" size="sm" className="absolute top-2 right-2" onClick={() => { setCopied(true); toast.success("Embed code copied"); setTimeout(() => setCopied(false), 1500); }}>
                    {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />} {copied ? "Copied" : "Copy"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="lg:sticky lg:top-6 lg:self-start">
            <p className="mb-2 text-sm font-medium">Live preview</p>
            <ChatbotWidgetPreview widget={widget} />
          </div>
        </div>
      )}

      {tab === "knowledge" && <KnowledgePanel sources={sources} setSources={setSources} />}
      {tab === "flow" && <FlowPanel intents={intents} setIntents={setIntents} leadFields={leadFields} setLeadFields={setLeadFields} />}
      {tab === "handoff" && <HandoffPanel rules={handoffRules} setRules={setHandoffRules} />}
      {tab === "crm" && <CrmPanel crm={crm} setCrm={setCrm} />}
    </div>
  );
}

function PromptAdder({ onAdd }: { onAdd: (v: string) => void }) {
  const [val, setVal] = useState("");
  return (
    <div className="flex gap-2">
      <Input value={val} onChange={(e) => setVal(e.target.value)} placeholder="Add a suggested prompt…" onKeyDown={(e) => { if (e.key === "Enter" && val.trim()) { onAdd(val.trim()); setVal(""); } }} />
      <Button variant="outline" size="sm" onClick={() => { if (val.trim()) { onAdd(val.trim()); setVal(""); } }}><Plus className="size-4" /> Add</Button>
    </div>
  );
}

function KnowledgePanel({ sources, setSources }: { sources: ChatbotKnowledgeSource[]; setSources: (s: ChatbotKnowledgeSource[]) => void }) {
  const [testQ, setTestQ] = useState("");
  const [answered, setAnswered] = useState(false);
  const addSource = (type: ChatbotSourceType) => {
    const labels: Record<ChatbotSourceType, string> = { document: "New document.pdf", url: "https://connectnx.io", faq: "New FAQ set", text: "Text snippet" };
    setSources([{ id: createChatbotChildId("src"), type, name: labels[type], detail: "queued for training", status: "training", chunks: 0, updatedAt: new Date().toISOString() }, ...sources]);
    toast.info("Source added — training started");
  };
  return (
    <div className="space-y-6">
      <Card className="shadow-none">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Knowledge sources</CardTitle>
            <p className="text-sm text-muted-foreground">The bot only answers from what you train it on — no hallucinations.</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button><Plus className="size-4" /> Add source</Button>} />
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => addSource("url")}><SOURCE_META.url.icon className="size-4" /> Crawl a website</DropdownMenuItem>
              <DropdownMenuItem onClick={() => addSource("document")}><SOURCE_META.document.icon className="size-4" /> Upload a document</DropdownMenuItem>
              <DropdownMenuItem onClick={() => addSource("faq")}><SOURCE_META.faq.icon className="size-4" /> Add FAQ pairs</DropdownMenuItem>
              <DropdownMenuItem onClick={() => addSource("text")}><SOURCE_META.text.icon className="size-4" /> Paste text</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent className="p-0">
          {sources.length === 0 ? (
            <p className="px-6 pb-6 text-sm text-muted-foreground">No sources yet. Add a website, document, or FAQ to train the bot.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow><TableHead>Source</TableHead><TableHead>Type</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Chunks</TableHead><TableHead>Updated</TableHead><TableHead className="w-20" /></TableRow>
              </TableHeader>
              <TableBody>
                {sources.map((s) => {
                  const Meta = SOURCE_META[s.type];
                  return (
                    <TableRow key={s.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Meta.icon className="size-4 text-muted-foreground" />
                          <div><p className="font-medium">{s.name}</p>{s.detail && <p className="text-xs text-muted-foreground">{s.detail}</p>}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{Meta.label}</TableCell>
                      <TableCell><Badge variant="outline" className={cn("border-0 capitalize", SOURCE_STATUS_STYLES[s.status])}>{s.status}</Badge></TableCell>
                      <TableCell className="text-right tabular-nums">{(s.chunks ?? 0).toLocaleString()}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{formatRelative(s.updatedAt)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon-sm" title="Retrain" onClick={() => { setSources(sources.map((x) => x.id === s.id ? { ...x, status: "training", updatedAt: new Date().toISOString() } : x)); toast.info("Retraining source…"); }}><RefreshCw className="size-4" /></Button>
                          <Button variant="ghost" size="icon-sm" onClick={() => setSources(sources.filter((x) => x.id !== s.id))}><Trash2 className="size-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-none">
        <CardHeader><CardTitle className="text-base">Test the bot</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input value={testQ} onChange={(e) => setTestQ(e.target.value)} placeholder="Ask a question your visitors might ask…" onKeyDown={(e) => { if (e.key === "Enter" && testQ.trim()) setAnswered(true); }} />
            <Button onClick={() => testQ.trim() && setAnswered(true)}><Send className="size-4" /> Ask</Button>
          </div>
          {answered && (
            <div className="rounded-lg border bg-muted/30 p-3">
              <p className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground"><Sparkles className="size-3.5" /> Answer (from your sources)</p>
              <p className="text-sm">Based on your Pricing FAQ, the Pro plan is ₹4,999/month billed annually and includes segmentation, sequences, and automations.</p>
              <p className="mt-2 text-xs text-muted-foreground">Sources used: Pricing FAQ · connectnx.io/docs</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function FlowPanel({ intents, setIntents, leadFields, setLeadFields }: { intents: ChatbotIntent[]; setIntents: (i: ChatbotIntent[]) => void; leadFields: ChatLeadField[]; setLeadFields: (l: ChatLeadField[]) => void }) {
  return (
    <div className="space-y-6">
      <Card className="shadow-none">
        <CardHeader className="flex flex-row items-center justify-between">
          <div><CardTitle className="text-base">Intents & routing</CardTitle><p className="text-sm text-muted-foreground">Detect what a visitor wants and decide what happens next.</p></div>
          <Button onClick={() => setIntents([...intents, { id: createChatbotChildId("i"), name: "New intent", examples: [], action: "answer" }])}><Plus className="size-4" /> Add intent</Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {intents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No intents yet — the bot will answer everything from its knowledge base.</p>
          ) : intents.map((intent) => (
            <div key={intent.id} className="rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <Input className="h-8 flex-1 font-medium" value={intent.name} onChange={(e) => setIntents(intents.map((x) => x.id === intent.id ? { ...x, name: e.target.value } : x))} />
                <Select value={intent.action} onValueChange={(v) => setIntents(intents.map((x) => x.id === intent.id ? { ...x, action: (v as ChatIntentAction) ?? "answer" } : x))}>
                  <SelectTrigger className="h-8 w-56"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(Object.keys(INTENT_ACTION_META) as ChatIntentAction[]).map((a) => (<SelectItem key={a} value={a}>{INTENT_ACTION_META[a].label}</SelectItem>))}
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="icon-sm" onClick={() => setIntents(intents.filter((x) => x.id !== intent.id))}><Trash2 className="size-4" /></Button>
              </div>
              <Input className="mt-2 h-8" value={intent.examples.join(", ")} onChange={(e) => setIntents(intents.map((x) => x.id === intent.id ? { ...x, examples: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) } : x))} placeholder="Training phrases, comma-separated (e.g. pricing, how much, cost)" />
              {(intent.action === "route_team" || intent.action === "handoff" || intent.action === "link") && (
                <Input className="mt-2 h-8" value={intent.target ?? ""} onChange={(e) => setIntents(intents.map((x) => x.id === intent.id ? { ...x, target: e.target.value } : x))} placeholder={intent.action === "link" ? "URL to share" : "Team or resource"} />
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="shadow-none">
        <CardHeader className="flex flex-row items-center justify-between">
          <div><CardTitle className="flex items-center gap-2 text-base"><UserPlus className="size-4 text-muted-foreground" /> Lead capture</CardTitle><p className="text-sm text-muted-foreground">Fields the bot asks for, and when.</p></div>
          <Button variant="outline" onClick={() => setLeadFields([...leadFields, { id: createChatbotChildId("lf"), label: "New field", crmField: "custom", required: false, askWhen: "after_intent" }])}><Plus className="size-4" /> Add field</Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {leadFields.length === 0 ? (
            <p className="text-sm text-muted-foreground">No lead capture fields configured.</p>
          ) : leadFields.map((f) => (
            <div key={f.id} className="flex flex-wrap items-center gap-2 rounded-lg border p-2.5">
              <Input className="h-8 w-40" value={f.label} onChange={(e) => setLeadFields(leadFields.map((x) => x.id === f.id ? { ...x, label: e.target.value } : x))} />
              <span className="text-xs text-muted-foreground">→ CRM</span>
              <Input className="h-8 w-32" value={f.crmField} onChange={(e) => setLeadFields(leadFields.map((x) => x.id === f.id ? { ...x, crmField: e.target.value } : x))} />
              <Select value={f.askWhen} onValueChange={(v) => setLeadFields(leadFields.map((x) => x.id === f.id ? { ...x, askWhen: (v as ChatLeadField["askWhen"]) ?? "after_intent" } : x))}>
                <SelectTrigger className="h-8 w-44"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="start">Ask at start</SelectItem>
                  <SelectItem value="after_intent">After intent</SelectItem>
                  <SelectItem value="before_handoff">Before handoff</SelectItem>
                </SelectContent>
              </Select>
              <label className="flex items-center gap-1.5 text-xs"><Switch checked={f.required} onCheckedChange={(v) => setLeadFields(leadFields.map((x) => x.id === f.id ? { ...x, required: v } : x))} /> Required</label>
              <Button variant="ghost" size="icon-sm" className="ml-auto" onClick={() => setLeadFields(leadFields.filter((x) => x.id !== f.id))}><Trash2 className="size-4" /></Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function HandoffPanel({ rules, setRules }: { rules: ChatHandoffRule[]; setRules: (r: ChatHandoffRule[]) => void }) {
  return (
    <Card className="shadow-none">
      <CardHeader className="flex flex-row items-center justify-between">
        <div><CardTitle className="text-base">Human handoff rules</CardTitle><p className="text-sm text-muted-foreground">When the bot should escalate to a person, and where it routes.</p></div>
        <Button onClick={() => setRules([...rules, { id: createChatbotChildId("h"), trigger: "user_request", routeTo: "inbox" }])}><Plus className="size-4" /> Add rule</Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {rules.length === 0 ? (
          <p className="text-sm text-muted-foreground">No handoff rules — the bot handles everything itself.</p>
        ) : rules.map((r) => (
          <div key={r.id} className="flex flex-wrap items-center gap-2 rounded-lg border p-3">
            <span className="text-sm text-muted-foreground">When</span>
            <Select value={r.trigger} onValueChange={(v) => setRules(rules.map((x) => x.id === r.id ? { ...x, trigger: (v as ChatHandoffTrigger) ?? "user_request" } : x))}>
              <SelectTrigger className="h-8 w-64"><SelectValue /></SelectTrigger>
              <SelectContent>{(Object.keys(HANDOFF_TRIGGER_LABELS) as ChatHandoffTrigger[]).map((t) => (<SelectItem key={t} value={t}>{HANDOFF_TRIGGER_LABELS[t]}</SelectItem>))}</SelectContent>
            </Select>
            {r.trigger === "keyword" && <Input className="h-8 w-40" value={r.keyword ?? ""} onChange={(e) => setRules(rules.map((x) => x.id === r.id ? { ...x, keyword: e.target.value } : x))} placeholder="keyword" />}
            <span className="text-sm text-muted-foreground">route to</span>
            <Select value={r.routeTo} onValueChange={(v) => setRules(rules.map((x) => x.id === r.id ? { ...x, routeTo: (v as ChatHandoffRule["routeTo"]) ?? "inbox" } : x))}>
              <SelectTrigger className="h-8 w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="inbox">Marketing inbox</SelectItem>
                <SelectItem value="owner">Contact owner</SelectItem>
                <SelectItem value="team">A team</SelectItem>
              </SelectContent>
            </Select>
            {r.routeTo === "team" && <Input className="h-8 w-40" value={r.target ?? ""} onChange={(e) => setRules(rules.map((x) => x.id === r.id ? { ...x, target: e.target.value } : x))} placeholder="Team name" />}
            <Button variant="ghost" size="icon-sm" className="ml-auto" onClick={() => setRules(rules.filter((x) => x.id !== r.id))}><Trash2 className="size-4" /></Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function CrmPanel({ crm, setCrm }: { crm: ChatbotCrmSync; setCrm: (c: ChatbotCrmSync) => void }) {
  const patch = (p: Partial<ChatbotCrmSync>) => setCrm({ ...crm, ...p });
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="shadow-none">
        <CardHeader><CardTitle className="text-base">CRM synchronization</CardTitle></CardHeader>
        <CardContent className="space-y-2.5">
          <Toggle label="Create a contact from captured leads" desc="New chat leads become CRM contacts." on={crm.createContact} onChange={(v) => patch({ createContact: v })} />
          <Toggle label="Update existing contacts" desc="Match by email and enrich the record." on={crm.updateContact} onChange={(v) => patch({ updateContact: v })} />
          <Toggle label="Log transcripts to the contact timeline" desc="Full chat history appears on the contact record." on={crm.logTranscript} onChange={(v) => patch({ logTranscript: v })} />
        </CardContent>
      </Card>
      <Card className="shadow-none">
        <CardHeader><CardTitle className="text-base">Defaults for new records</CardTitle></CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label>Default owner</Label>
            <Select value={crm.defaultOwner ?? "unassigned"} onValueChange={(v) => patch({ defaultOwner: !v || v === "unassigned" ? undefined : v })}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {["Priya Sharma", "Arjun Mehta", "Neha Reddy", "Karthik N"].map((o) => (<SelectItem key={o} value={o}>{o}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Lifecycle stage</Label>
            <Select value={crm.lifecycleStage ?? "lead"} onValueChange={(v) => patch({ lifecycleStage: v ?? "lead" })}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>{["subscriber", "lead", "mql", "sql"].map((s) => (<SelectItem key={s} value={s} className="uppercase">{s}</SelectItem>))}</SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Toggle({ label, desc, on, onChange }: { label: string; desc: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <div className="pr-4"><p className="text-sm font-medium">{label}</p><p className="text-xs text-muted-foreground">{desc}</p></div>
      <Switch checked={on} onCheckedChange={onChange} />
    </div>
  );
}
