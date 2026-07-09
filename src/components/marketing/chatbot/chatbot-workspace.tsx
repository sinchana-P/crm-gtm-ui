"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Archive,
  ArchiveRestore,
  ArrowUpRight,
  Bot,
  Copy,
  ExternalLink,
  MapPin,
  MessageSquare,
  MoreHorizontal,
  Pause,
  Pencil,
  Play,
  Plus,
  Search,
  Target,
  Trash2,
  UserCheck,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import type { Chatbot, ChatConversation } from "@/lib/types";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MOCK_CHAT_CONVERSATIONS,
  MOCK_CHAT_INTENT_STATS,
  MOCK_CHAT_VOLUME,
} from "@/lib/mock-data/chatbot";
import { formatDateTime, formatRelative } from "@/lib/format";
import { useChatbotStore } from "@/lib/stores/chatbot-store";
import { cn } from "@/lib/utils";
import {
  ChatbotAvatar,
  ChatbotStatusBadge,
  CONVO_STATUS_META,
  placementSummary,
  SENTIMENT_META,
} from "@/components/marketing/chatbot/chatbot-shared";

const volumeConfig = {
  conversations: { label: "Conversations", color: "var(--chart-1)" },
  resolved: { label: "Resolved by bot", color: "var(--chart-2)" },
} satisfies ChartConfig;

export function ChatbotWorkspace() {
  const router = useRouter();
  const chatbots = useChatbotStore((s) => s.chatbots);
  const duplicateChatbot = useChatbotStore((s) => s.duplicateChatbot);
  const setStatus = useChatbotStore((s) => s.setStatus);
  const setArchived = useChatbotStore((s) => s.setArchived);
  const deleteChatbot = useChatbotStore((s) => s.deleteChatbot);

  const [search, setSearch] = useState("");
  const [convoSearch, setConvoSearch] = useState("");
  const [convoStatus, setConvoStatus] = useState("all");
  const [botFilter, setBotFilter] = useState("all");
  const [selected, setSelected] = useState<ChatConversation | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Chatbot | null>(null);

  const live = chatbots.filter((b) => !b.archived);
  const totalConvos = live.reduce((n, b) => n + b.conversations, 0);
  const totalLeads = live.reduce((n, b) => n + b.leadsCaptured, 0);
  const totalHandoffs = live.reduce((n, b) => n + b.handoffs, 0);
  const avgDeflection = live.filter((b) => b.conversations > 0);
  const deflection = avgDeflection.length ? (avgDeflection.reduce((n, b) => n + b.deflectionRate, 0) / avgDeflection.length).toFixed(1) : "0.0";

  const filteredBots = useMemo(() => {
    const q = search.toLowerCase();
    return chatbots.filter((b) => !b.archived && (!q || b.name.toLowerCase().includes(q) || (b.description ?? "").toLowerCase().includes(q)));
  }, [chatbots, search]);
  const archivedBots = chatbots.filter((b) => b.archived);

  const conversations = useMemo(() => {
    const q = convoSearch.toLowerCase();
    return MOCK_CHAT_CONVERSATIONS.filter((c) => {
      if (convoStatus !== "all" && c.status !== convoStatus) return false;
      if (botFilter !== "all" && c.chatbotId !== botFilter) return false;
      if (q && !c.visitorName.toLowerCase().includes(q) && !(c.visitorEmail ?? "").toLowerCase().includes(q) && !(c.intent ?? "").toLowerCase().includes(q)) return false;
      return true;
    });
  }, [convoSearch, convoStatus, botFilter]);

  const botName = (id: string) => chatbots.find((b) => b.id === id)?.name ?? "—";
  const maxIntent = Math.max(...MOCK_CHAT_INTENT_STATS.map((i) => i.count), 1);

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Chatbot"
        description="Deploy embeddable chat assistants that answer from your knowledge, capture leads, and hand off to humans."
        actions={<Button onClick={() => router.push("/marketing/chatbot/new")}><Plus className="size-4" /> New chatbot</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Conversations" value={totalConvos.toLocaleString()} subtitle="Across all bots" icon={MessageSquare} />
        <StatCard title="Bot deflection" value={`${deflection}%`} subtitle="Resolved without a human" icon={Bot} />
        <StatCard title="Leads captured" value={totalLeads.toLocaleString()} subtitle="Synced to CRM" icon={UserCheck} />
        <StatCard title="Handoffs" value={totalHandoffs.toLocaleString()} subtitle="Escalated to a person" icon={ArrowUpRight} />
      </div>

      <Tabs defaultValue="bots">
        <TabsList>
          <TabsTrigger value="bots">Chatbots</TabsTrigger>
          <TabsTrigger value="conversations">Conversations</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Chatbots */}
        <TabsContent value="bots" className="mt-6 space-y-4">
          <div className="relative">
            <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-8" placeholder="Search chatbots…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          {filteredBots.length === 0 ? (
            <EmptyState icon={Bot} title="No chatbots yet" description="Create an embeddable AI assistant for your website." action={<Button onClick={() => router.push("/marketing/chatbot/new")}><Plus className="size-4" /> New chatbot</Button>} />
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {filteredBots.map((b) => (
                <Card key={b.id} className="shadow-none transition-shadow hover:shadow-md">
                  <CardContent className="pt-5">
                    <div className="flex items-start gap-3">
                      <ChatbotAvatar initials={b.widget.avatarInitials} color={b.widget.themeColor} className="size-10" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <button type="button" className="truncate font-medium hover:underline" onClick={() => router.push(`/marketing/chatbot/${b.id}`)}>{b.name}</button>
                          <ChatbotStatusBadge status={b.status} />
                        </div>
                        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{b.description}</p>
                        <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                          <MapPin className="size-3" /> {placementSummary(b.placement)}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm"><MoreHorizontal className="size-4" /></Button>} />
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.push(`/marketing/chatbot/${b.id}`)}><Pencil className="size-4" /> Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { duplicateChatbot(b.id); toast.success("Chatbot duplicated"); }}><Copy className="size-4" /> Duplicate</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {b.status === "active" ? (
                            <DropdownMenuItem onClick={() => { setStatus(b.id, "paused"); toast.success("Chatbot paused"); }}><Pause className="size-4" /> Pause</DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => { setStatus(b.id, "active"); toast.success("Chatbot activated"); }}><Play className="size-4" /> {b.status === "draft" ? "Publish" : "Resume"}</DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => { setArchived(b.id, true); toast.success("Chatbot archived"); }}><Archive className="size-4" /> Archive</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setDeleteTarget(b)}><Trash2 className="size-4 text-destructive" /><span className="text-destructive">Delete</span></DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="mt-4 grid grid-cols-4 gap-2 border-t pt-3 text-center">
                      <Stat label="Chats" value={b.conversations.toLocaleString()} />
                      <Stat label="Deflect" value={`${b.deflectionRate}%`} />
                      <Stat label="Leads" value={b.leadsCaptured.toLocaleString()} />
                      <Stat label="Handoffs" value={b.handoffs.toLocaleString()} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          {archivedBots.length > 0 && (
            <div className="pt-2">
              <p className="mb-2 text-xs font-medium text-muted-foreground uppercase">Archived</p>
              <div className="space-y-2">
                {archivedBots.map((b) => (
                  <div key={b.id} className="flex items-center justify-between rounded-lg border px-3 py-2">
                    <span className="text-sm text-muted-foreground line-through">{b.name}</span>
                    <Button variant="ghost" size="sm" onClick={() => { setArchived(b.id, false); toast.success("Chatbot restored"); }}><ArchiveRestore className="size-4" /> Restore</Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Conversations */}
        <TabsContent value="conversations" className="mt-6 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-8" placeholder="Search visitor, email, or intent…" value={convoSearch} onChange={(e) => setConvoSearch(e.target.value)} />
            </div>
            <Select value={botFilter} onValueChange={(v) => setBotFilter(v ?? "all")}>
              <SelectTrigger className="w-full sm:w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All chatbots</SelectItem>
                {chatbots.filter((b) => !b.archived).map((b) => (<SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>))}
              </SelectContent>
            </Select>
            <Select value={convoStatus} onValueChange={(v) => setConvoStatus(v ?? "all")}>
              <SelectTrigger className="w-full sm:w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="bot">Bot</SelectItem>
                <SelectItem value="handed_off">Handed off</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="abandoned">Abandoned</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {conversations.length === 0 ? (
            <EmptyState icon={MessageSquare} title="No conversations" description="Chats will appear here as visitors talk to your bots." />
          ) : (
            <Card className="shadow-none">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow><TableHead>Visitor</TableHead><TableHead>Chatbot</TableHead><TableHead>Status</TableHead><TableHead>Intent</TableHead><TableHead>Lead</TableHead><TableHead>Sentiment</TableHead><TableHead>Last activity</TableHead></TableRow>
                  </TableHeader>
                  <TableBody>
                    {conversations.map((c) => (
                      <TableRow key={c.id} className="cursor-pointer" onClick={() => setSelected(c)}>
                        <TableCell>
                          <p className="font-medium">{c.visitorName}</p>
                          <p className="text-xs text-muted-foreground">{c.visitorEmail ?? c.page}</p>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{botName(c.chatbotId)}</TableCell>
                        <TableCell><Badge variant="outline" className={cn("border-0", CONVO_STATUS_META[c.status].className)}>{CONVO_STATUS_META[c.status].label}</Badge></TableCell>
                        <TableCell className="text-sm text-muted-foreground">{c.intent ?? "—"}</TableCell>
                        <TableCell>{c.leadCaptured ? <Badge variant="outline" className="border-0 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">Captured</Badge> : <span className="text-xs text-muted-foreground">—</span>}</TableCell>
                        <TableCell>{c.sentiment ? <span className={cn("text-xs font-medium", SENTIMENT_META[c.sentiment].className)}>{SENTIMENT_META[c.sentiment].label}</span> : "—"}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{formatRelative(c.lastAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="mt-6 space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="shadow-none">
              <CardHeader><CardTitle className="text-base">Conversation volume</CardTitle></CardHeader>
              <CardContent>
                <ChartContainer config={volumeConfig} className="h-[240px] w-full">
                  <LineChart data={MOCK_CHAT_VOLUME.map((d) => ({ ...d, label: format(new Date(d.date), "MMM d") }))}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} width={40} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="conversations" stroke="var(--color-conversations)" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="resolved" stroke="var(--color-resolved)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>
            <Card className="shadow-none">
              <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Target className="size-4 text-muted-foreground" /> Top intents</CardTitle></CardHeader>
              <CardContent className="space-y-2.5">
                {MOCK_CHAT_INTENT_STATS.map((i) => (
                  <div key={i.intent} className="space-y-1">
                    <div className="flex items-center justify-between text-sm"><span className={i.intent === "No intent matched" ? "text-muted-foreground" : ""}>{i.intent}</span><span className="tabular-nums text-muted-foreground">{i.count}</span></div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted"><div className={cn("h-full rounded-full", i.intent === "No intent matched" ? "bg-amber-500" : "bg-primary")} style={{ width: `${(i.count / maxIntent) * 100}%` }} /></div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
          <Card className="shadow-none">
            <CardHeader><CardTitle className="text-base">Per-chatbot performance</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader><TableRow><TableHead>Chatbot</TableHead><TableHead className="text-right">Conversations</TableHead><TableHead className="text-right">Deflection</TableHead><TableHead className="text-right">Leads</TableHead><TableHead className="text-right">Handoffs</TableHead></TableRow></TableHeader>
                <TableBody>
                  {live.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="font-medium">{b.name}</TableCell>
                      <TableCell className="text-right tabular-nums">{b.conversations.toLocaleString()}</TableCell>
                      <TableCell className="text-right tabular-nums">{b.deflectionRate}%</TableCell>
                      <TableCell className="text-right tabular-nums">{b.leadsCaptured.toLocaleString()}</TableCell>
                      <TableCell className="text-right tabular-nums">{b.handoffs.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Transcript drawer */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="flex w-full flex-col sm:max-w-md">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle>{selected.visitorName}</SheetTitle>
                <SheetDescription>{botName(selected.chatbotId)} · {selected.page ?? "—"}</SheetDescription>
              </SheetHeader>
              <div className="flex flex-wrap items-center gap-2 border-b px-4 pb-3">
                <Badge variant="outline" className={cn("border-0", CONVO_STATUS_META[selected.status].className)}>{CONVO_STATUS_META[selected.status].label}</Badge>
                {selected.intent && <Badge variant="outline">{selected.intent}</Badge>}
                {selected.leadCaptured && <Badge variant="outline" className="border-0 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">Lead captured</Badge>}
                {selected.contactId && (
                  <Button variant="ghost" size="sm" className="ml-auto" onClick={() => router.push(`/contacts/${selected.contactId}`)}>
                    View contact <ExternalLink className="size-3.5" />
                  </Button>
                )}
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
                {selected.messages.map((m) => (
                  m.role === "system" ? (
                    <p key={m.id} className="text-center text-[11px] text-muted-foreground">— {m.text} —</p>
                  ) : (
                    <div key={m.id} className={cn("flex", m.role === "visitor" ? "justify-end" : "justify-start")}>
                      <div className={cn("max-w-[80%] rounded-2xl px-3 py-2 text-sm", m.role === "visitor" ? "rounded-tr-sm bg-primary text-primary-foreground" : m.role === "agent" ? "rounded-tl-sm bg-violet-500/10 text-foreground" : "rounded-tl-sm bg-muted text-foreground")}>
                        {(m.role === "bot" || m.role === "agent") && <p className="mb-0.5 text-[10px] font-medium text-muted-foreground uppercase">{m.role === "agent" ? "Human agent" : "Bot"}</p>}
                        {m.text}
                        <p className={cn("mt-1 text-[10px]", m.role === "visitor" ? "text-primary-foreground/70" : "text-muted-foreground")}>{formatDateTime(m.at)}</p>
                      </div>
                    </div>
                  )
                ))}
              </div>
              {selected.contactId && (
                <div className="border-t px-4 py-3 text-xs text-muted-foreground">
                  <Users className="mr-1 inline size-3.5" /> This transcript is logged on the contact&rsquo;s timeline.
                </div>
              )}
            </>
          )}
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          {deleteTarget && (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete “{deleteTarget.name}”?</AlertDialogTitle>
                <AlertDialogDescription>
                  {deleteTarget.status === "active"
                    ? "This bot is live on your site. Deleting removes the widget immediately. Consider archiving instead."
                    : "This permanently removes the chatbot. Past conversations stay on contact timelines."}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
                {deleteTarget.status === "active" ? (
                  <Button onClick={() => { setArchived(deleteTarget.id, true); setDeleteTarget(null); toast.success("Chatbot archived instead"); }}><Archive className="size-4" /> Archive instead</Button>
                ) : (
                  <Button variant="destructive" onClick={() => { deleteChatbot(deleteTarget.id); setDeleteTarget(null); toast.success("Chatbot deleted"); }}><Trash2 className="size-4" /> Delete</Button>
                )}
              </AlertDialogFooter>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm font-semibold tabular-nums">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}
