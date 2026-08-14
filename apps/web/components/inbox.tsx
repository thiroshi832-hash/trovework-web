"use client";

import { useState } from "react";
import Link from "next/link";
import { Portrait } from "@/components/brand";
import { ArrowLeft, Lock, Search, ShieldCheck } from "@/components/icons";
import { FREELANCER_THREADS, MESSAGES, type Conversation, type Message } from "@/lib/conversations";

export function Inbox() {
  const threads = FREELANCER_THREADS;
  const [activeId, setActiveId] = useState(threads[0]?.id ?? "");
  const [draft, setDraft] = useState("");
  const [sent, setSent] = useState<Message[]>([]);
  const [notice, setNotice] = useState(false);
  const [query, setQuery] = useState("");
  // Below lg the two panes stack, so the list and the thread take turns.
  const [showThread, setShowThread] = useState(false);

  const shown = threads.filter((t) =>
    (t.withName + t.lastMessage).toLowerCase().includes(query.trim().toLowerCase()),
  );
  const active = threads.find((t) => t.id === activeId);
  const messages = [...(MESSAGES[activeId] ?? []), ...sent];

  function open(t: Conversation) {
    setActiveId(t.id);
    setSent([]);
    setNotice(false);
    setShowThread(true);
  }

  function send() {
    const body = draft.trim();
    if (!body) return;
    setSent([...sent, { id: `local-${sent.length}`, from: "me", body, at: "Just now" }]);
    setDraft("");
    setNotice(true);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
      {/* ------------------------------ threads ----------------------------- */}
      <aside
        className={`${showThread ? "hidden lg:block" : "block"} h-fit rounded-2xl border border-slate-200 bg-white`}
      >
        <div className="border-b border-slate-200 p-4">
          <label className="sr-only" htmlFor="thread-search">
            Search conversations
          </label>
          <span className="relative block">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
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

        <ul className="divide-y divide-slate-100">
          {shown.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => open(t)}
                aria-current={t.id === activeId ? "true" : undefined}
                className={`flex w-full items-center gap-3 p-4 text-left transition ${
                  t.id === activeId ? "bg-brand-50" : "hover:bg-slate-50"
                }`}
              >
                <Portrait src={t.withPhoto} sizes="40px" className="h-10 w-10" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-navy-800">{t.withName}</p>
                    <span className="shrink-0 text-xs text-slate-400">{t.when}</span>
                  </div>
                  <p className="mt-0.5 truncate text-sm text-slate-500">{t.lastMessage}</p>
                </div>
                {t.unread > 0 ? (
                  <span className="grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-brand-600 px-1.5 text-[11px] font-semibold text-white">
                    {t.unread}
                  </span>
                ) : null}
              </button>
            </li>
          ))}
          {shown.length === 0 ? (
            <li className="p-8 text-center text-sm text-slate-500">No conversations match.</li>
          ) : null}
        </ul>
      </aside>

      {/* ------------------------------- thread ----------------------------- */}
      <section
        className={`${showThread ? "block" : "hidden lg:block"} flex min-h-[32rem] flex-col rounded-2xl border border-slate-200 bg-white`}
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
                <ArrowLeft className="h-4 w-4" />
              </button>
              <Portrait src={active.withPhoto} sizes="40px" className="h-10 w-10" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-navy-800">{active.withName}</p>
                <p className="text-xs text-slate-500">{active.withRole}</p>
              </div>
              <span className="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 sm:flex">
                <ShieldCheck className="h-3.5 w-3.5" />
                Verified
              </span>
            </header>

            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
                  <div className="max-w-[80%]">
                    <div
                      className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        m.from === "me"
                          ? "rounded-br-md bg-brand-600 text-white"
                          : "rounded-bl-md bg-slate-100 text-navy-800"
                      }`}
                    >
                      {m.body}
                    </div>
                    <p className={`mt-1 text-[11px] text-slate-400 ${m.from === "me" ? "text-right" : ""}`}>
                      {m.at}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {notice ? (
              <p className="mx-5 mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-3 text-sm leading-relaxed text-amber-800">
                Nothing was sent — real-time chat needs the Socket.IO layer, so this message exists
                only in this browser tab.
              </p>
            ) : null}

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
                      send();
                    }
                  }}
                  placeholder="Write a message…"
                  className="max-h-32 min-h-11 w-full resize-y rounded-lg border border-slate-200 bg-white px-3.5 py-3 text-sm text-navy-800 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                />
                <button
                  type="button"
                  onClick={send}
                  disabled={!draft.trim()}
                  className="shrink-0 rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                >
                  Send
                </button>
              </div>
              <p className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-400">
                <Lock className="h-3.5 w-3.5" />
                Keep contact details out of messages until you&apos;ve agreed to work together.
              </p>
            </div>
          </>
        ) : (
          <div className="grid flex-1 place-items-center p-10 text-center">
            <div>
              <p className="font-semibold text-navy-800">No conversation selected</p>
              <p className="mt-1 text-sm text-slate-500">Pick a thread on the left to read it.</p>
              <Link
                href="/dashboard/freelancer"
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
