"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { ArrowLeft, Lock, Search, ShieldCheck } from "@/components/icons";
import { api } from "@/lib/api";

/* ------------------------------ data shapes ------------------------------- */

interface Party {
  id: string;
  fullName: string;
}
interface ApiConversation {
  id: string;
  clientId: string;
  freelancerId: string;
  client?: Party;
  freelancer?: Party;
  lastMessageAt: string | null;
  unreadCount: number;
}
interface ApiMessage {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  sentAt: string;
}

interface Thread {
  id: string;
  withName: string;
  withRole: string;
  lastMessage: string;
  lastAt: string | null;
  unread: number;
}

function initialsOf(name: string): string {
  return name.split(/\s+/).map((p) => p[0] ?? "").join("").slice(0, 2).toUpperCase() || "?";
}
function Avatar({ name, className = "" }: { name: string; className?: string }) {
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-400 to-brand-700 font-semibold text-white ${className}`}
    >
      {initialsOf(name)}
    </span>
  );
}
function clockOf(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(+d) ? "" : d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export function Inbox() {
  const params = useSearchParams();
  const wanted = params.get("c");

  const [meId, setMeId] = useState<string | null>(null);
  const [meRole, setMeRole] = useState<string>("");
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [messages, setMessages] = useState<ApiMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [showThread, setShowThread] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const adapt = useCallback(
    (c: ApiConversation, myId: string): Thread => {
      const iAmClient = c.clientId === myId;
      const other = (iAmClient ? c.freelancer : c.client) ?? { id: "", fullName: "Someone" };
      return {
        id: c.id,
        withName: other.fullName,
        withRole: iAmClient ? "Freelancer" : "Client",
        lastMessage: "",
        lastAt: c.lastMessageAt,
        unread: c.unreadCount ?? 0,
      };
    },
    [],
  );

  /* -------------------------------- initial load ------------------------------- */
  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const me = await api.me();
        if (!live) return;
        setMeId(me.id);
        setMeRole(me.role);
        const rows = (await api.chat.list()) as ApiConversation[];
        if (!live) return;
        setThreads(rows.map((r) => adapt(r, me.id)));
      } catch {
        if (live) setLoadError(true);
      } finally {
        if (live) setLoading(false);
      }
    })();
    return () => {
      live = false;
    };
  }, [adapt]);

  /* -------------------------------- socket setup ------------------------------- */
  useEffect(() => {
    if (!meId) return;
    // Same-origin; the auth cookie rides the handshake. nginx (prod) / the dev
    // rewrite route /socket.io to the API server.
    const socket = io("/chat", { withCredentials: true, transports: ["websocket", "polling"] });
    socketRef.current = socket;

    socket.on("message:new", (msg: ApiMessage) => {
      setMessages((prev) =>
        msg.conversationId === activeIdRef.current && !prev.some((m) => m.id === msg.id)
          ? [...prev, msg]
          : prev,
      );
      setThreads((prev) =>
        prev.map((t) =>
          t.id === msg.conversationId
            ? {
                ...t,
                lastMessage: msg.body,
                lastAt: msg.sentAt,
                unread:
                  msg.conversationId === activeIdRef.current || msg.senderId === meId
                    ? t.unread
                    : t.unread + 1,
              }
            : t,
        ),
      );
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [meId]);

  // activeId read inside the socket handler without re-subscribing on each change.
  const activeIdRef = useRef(activeId);
  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  /* --------------------------- auto-open a thread ------------------------------ */
  useEffect(() => {
    if (loading || !meId) return;
    const target = wanted && threads.some((t) => t.id === wanted) ? wanted : threads[0]?.id;
    if (target && !activeId) void open(target);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, meId, wanted, threads]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  async function open(id: string) {
    setActiveId(id);
    setShowThread(true);
    setMessages([]);
    socketRef.current?.emit("conversation:join", { conversationId: id });
    try {
      const rows = (await api.chat.messages(id)) as ApiMessage[];
      setMessages(rows);
      await api.chat.markRead(id);
      setThreads((prev) => prev.map((t) => (t.id === id ? { ...t, unread: 0 } : t)));
    } catch {
      /* leave the pane empty; a reopen retries */
    }
  }

  async function send() {
    const body = draft.trim();
    if (!body || !activeId) return;
    setDraft("");
    const socket = socketRef.current;
    if (socket?.connected) {
      // The server persists and broadcasts message:new back to us, which appends it.
      socket.emit("message:send", { conversationId: activeId, body });
    } else {
      // Fallback when the socket is down — REST still persists.
      try {
        const msg = (await api.chat.send(activeId, body)) as ApiMessage;
        setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
      } catch {
        setDraft(body); // restore so the text isn't lost
      }
    }
  }

  const active = threads.find((t) => t.id === activeId);
  const shown = useMemo(
    () =>
      threads.filter((t) => (t.withName + t.lastMessage).toLowerCase().includes(query.trim().toLowerCase())),
    [threads, query],
  );

  if (loadError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        We couldn&apos;t load your messages. Make sure you&apos;re signed in, then refresh.
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
      {/* ------------------------------ threads ----------------------------- */}
      <aside
        className={`${showThread ? "hidden lg:block" : "block"} h-fit min-w-0 rounded-2xl border border-slate-200 bg-white`}
      >
        <div className="border-b border-slate-200 p-4">
          <label className="sr-only" htmlFor="thread-search">
            Search conversations
          </label>
          <span className="relative block">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              id="thread-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search conversations"
              className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-3.5 text-sm text-navy-800 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </span>
        </div>

        {loading ? (
          <div className="space-y-2 p-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-lg bg-slate-50" />
            ))}
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {shown.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => open(t.id)}
                  aria-current={t.id === activeId ? "true" : undefined}
                  className={`flex w-full items-center gap-3 p-4 text-left transition ${
                    t.id === activeId ? "bg-brand-50" : "hover:bg-slate-50"
                  }`}
                >
                  <Avatar name={t.withName} className="h-10 w-10 text-sm" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-navy-800">{t.withName}</p>
                      <span className="shrink-0 text-xs text-slate-400">{clockOf(t.lastAt)}</span>
                    </div>
                    <p className="mt-0.5 truncate text-sm text-slate-500">{t.lastMessage || t.withRole}</p>
                  </div>
                  {t.unread > 0 ? (
                    <span className="grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-brand-600 px-1.5 text-[0.6875rem] font-semibold text-white">
                      {t.unread}
                    </span>
                  ) : null}
                </button>
              </li>
            ))}
            {shown.length === 0 ? (
              <li className="p-8 text-center text-sm text-slate-500">
                {threads.length === 0 ? "No conversations yet." : "No conversations match."}
              </li>
            ) : null}
          </ul>
        )}
      </aside>

      {/* ------------------------------- thread ----------------------------- */}
      <section
        className={`${showThread ? "flex" : "hidden lg:flex"} min-h-[32rem] min-w-0 flex-col rounded-2xl border border-slate-200 bg-white`}
      >
        {active ? (
          <>
            <header className="flex items-center gap-3 border-b border-slate-200 p-4">
              <button
                type="button"
                onClick={() => setShowThread(false)}
                className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 lg:hidden"
                aria-label="Back to conversations"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <Avatar name={active.withName} className="h-10 w-10 text-sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-navy-800">{active.withName}</p>
                <p className="text-xs text-slate-500">{active.withRole}</p>
              </div>
              <span className="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 sm:flex">
                <ShieldCheck className="h-4.5 w-4.5" />
                Verified
              </span>
            </header>

            <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-5">
              {messages.map((m) => {
                const mine = m.senderId === meId;
                return (
                  <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div className="max-w-[80%]">
                      <div
                        className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                          mine ? "rounded-br-md bg-brand-600 text-white" : "rounded-bl-md bg-slate-100 text-navy-800"
                        }`}
                      >
                        {m.body}
                      </div>
                      <p className={`mt-1 text-[0.6875rem] text-slate-400 ${mine ? "text-right" : ""}`}>
                        {clockOf(m.sentAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
              {messages.length === 0 ? (
                <p className="py-10 text-center text-sm text-slate-400">
                  No messages yet — say hello.
                </p>
              ) : null}
            </div>

            <div className="border-t border-slate-200 p-4">
              <div className="flex items-end gap-3">
                <label className="sr-only" htmlFor="composer">
                  Write a message
                </label>
                <textarea
                  id="composer"
                  rows={1}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void send();
                    }
                  }}
                  placeholder="Write a message…"
                  className="max-h-32 min-h-11 w-full resize-y rounded-lg border border-slate-200 bg-white px-3.5 py-3 text-sm text-navy-800 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                />
                <button
                  type="button"
                  onClick={() => void send()}
                  disabled={!draft.trim()}
                  className="shrink-0 rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                >
                  Send
                </button>
              </div>
              <p className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-400">
                <Lock className="h-4.5 w-4.5" />
                Keep contact details out of messages until you&apos;ve agreed to work together.
              </p>
            </div>
          </>
        ) : (
          <div className="grid flex-1 place-items-center p-10 text-center">
            <div>
              <p className="font-semibold text-navy-800">No conversation selected</p>
              <p className="mt-1 text-sm text-slate-500">
                {threads.length === 0
                  ? "When a verified client starts a chat, it shows up here."
                  : "Pick a thread on the left to read it."}
              </p>
              <Link
                href={meRole === "client" ? "/dashboard/client" : "/dashboard/freelancer"}
                className="mt-5 inline-block rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-navy-800 transition hover:bg-slate-50"
              >
                Back to dashboard
              </Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
