"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Lock, ShieldCheck } from "@/components/icons";
import { Select } from "@/components/select";
import { ApiError, api, type AnalyticsStats, type Category, type Page } from "@/lib/api";

const TABS = ["ID review", "Users", "Analytics", "Categories", "Violations", "Blocked posts", "Banned users"] as const;
type Tab = (typeof TABS)[number];

const CARD = "rounded-2xl border border-slate-200 bg-white";
const PAGE_SIZE = 20;

/* ------------------------------ data shapes ------------------------------- */

interface Verification {
  id: string;
  fullName: string;
  dob: string;
  idNumber: string;
  score: number | string | null;
  createdAt: string;
  idBackPath?: string | null;
  user?: { email: string; role: string };
}
interface Violation {
  id: string;
  detectedText: string;
  createdAt: string;
  user?: { fullName: string; email: string; strikeCount: number; status: string };
  post?: { title: string } | null;
}
interface BlockedPost {
  id: string;
  title: string;
  description: string;
  blockedReason: string | null;
  author?: { fullName: string; email: string };
}
interface BannedUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
  strikeCount: number;
}
interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
  status: string;
  strikeCount: number;
  phoneVerified: boolean;
  idVerified: boolean;
  createdAt: string;
}
interface UserDetail extends AdminUser {
  phone?: string | null;
  country?: string;
  state?: string;
  profile?: {
    slug: string;
    displayName: string;
    category: string;
    isVisible: boolean;
    photoPath?: string | null;
    contactTelegram?: string | null;
    contactDiscord?: string | null;
    contactWhatsapp?: string | null;
    contactLinkedin?: string | null;
  } | null;
  signupIp?: string | null;
  lastLoginIp?: string | null;
  lastLoginAt?: string | null;
  ipIntel?: Record<string, { hosting: boolean; proxy: boolean; country: string | null }>;
  postCount: number;
  conversationCount: number;
  latestVerification?: {
    id: string;
    status: string;
    createdAt: string;
    hasFront: boolean;
    hasBack: boolean;
    hasSelfie: boolean;
  } | null;
}

/** Absolute date + time for the visitor history (visits are rare enough that a
 *  relative "2h ago" hides the detail an admin wants). */
function fmtDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Flags an IP as datacentre/VPS or VPN/proxy, or plain "Direct" once checked. */
function IpTypeBadges({ v }: { v: VisitRow }) {
  const badge = "rounded-full px-2 py-0.5 text-[0.625rem] font-medium";
  if (!v.ip) return <span className="text-slate-400">—</span>;
  if (!v.classified) return <span className={`${badge} bg-slate-100 text-slate-500`}>checking…</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {v.hosting ? <span className={`${badge} bg-amber-100 text-amber-700`}>VPS / hosting</span> : null}
      {v.proxy ? <span className={`${badge} bg-red-100 text-red-700`}>VPN / proxy</span> : null}
      {!v.hosting && !v.proxy ? <span className={`${badge} bg-emerald-100 text-emerald-700`}>Direct</span> : null}
    </div>
  );
}

/** An IP plus its VPS/VPN/proxy flags and country, for the user detail view. */
function IpWithFlags({
  ip,
  intel,
}: {
  ip: string | null | undefined;
  intel?: { hosting: boolean; proxy: boolean; country: string | null };
}) {
  const badge = "rounded-full px-2 py-0.5 text-[0.625rem] font-medium";
  if (!ip) return <span className="text-slate-400">—</span>;
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      <span className="font-mono text-xs text-navy-800">{ip}</span>
      {intel ? (
        <>
          {intel.hosting ? <span className={`${badge} bg-amber-100 text-amber-700`}>VPS</span> : null}
          {intel.proxy ? <span className={`${badge} bg-red-100 text-red-700`}>VPN / proxy</span> : null}
          {!intel.hosting && !intel.proxy ? (
            <span className={`${badge} bg-emerald-100 text-emerald-700`}>Direct</span>
          ) : null}
          {intel.country ? <span className="text-xs text-slate-500">{intel.country}</span> : null}
        </>
      ) : (
        <span className="text-xs text-slate-400">unclassified</span>
      )}
    </span>
  );
}

/** A labelled metric tile for the Analytics tab. */
function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className={`${CARD} p-5`}>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-3xl font-bold text-navy-800">{value.toLocaleString()}</p>
    </div>
  );
}

type Paged<T> = Page<T>;

type VisitorStats = AnalyticsStats;

interface VisitRow {
  id: string;
  at: string;
  ip: string | null;
  userAgent: string | null;
  country: string | null;
  hosting: boolean | null;
  proxy: boolean | null;
  classified: boolean;
}

/**
 * A daily bar chart over the last 30 days. The API only returns days that had
 * activity, so we fill the window with zeros to get a continuous axis (a
 * launching site has sparse data, and gaps would misread as "no data" rather
 * than "none"). Reused for visitors and for new signups.
 */
function DailyBarChart({
  title,
  daily,
  unit,
  barClass = "bg-brand-500 group-hover:bg-brand-600",
}: {
  title: string;
  daily: { day: string; count: number }[];
  unit: string;
  barClass?: string;
}) {
  const counts = new Map(daily.map((d) => [d.day, d.count]));
  const now = new Date();
  const series: { day: string; count: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const dt = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i));
    const key = dt.toISOString().slice(0, 10);
    series.push({ day: key, count: counts.get(key) ?? 0 });
  }
  const max = Math.max(1, ...series.map((d) => d.count));
  const fmt = (day: string) =>
    new Date(`${day}T00:00:00Z`).toLocaleDateString(undefined, { month: "short", day: "numeric", timeZone: "UTC" });

  return (
    <div className={`${CARD} p-5`}>
      <div className="mb-3 flex items-baseline justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{title}</p>
        <p className="text-xs text-slate-400">Peak {max.toLocaleString()}/day</p>
      </div>
      <div className="flex h-32 items-end gap-[3px]">
        {series.map((d) => (
          <div
            key={d.day}
            className="group flex h-full flex-1 items-end"
            title={`${fmt(d.day)}: ${d.count.toLocaleString()} ${unit}${d.count === 1 ? "" : "s"}`}
          >
            <div
              className={`w-full rounded-t transition ${barClass}`}
              style={{ height: `${Math.max(d.count === 0 ? 0 : 4, Math.round((d.count / max) * 100))}%` }}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[0.65rem] text-slate-400">
        <span>{fmt(series[0].day)}</span>
        <span>{fmt(series[series.length - 1].day)}</span>
      </div>
    </div>
  );
}
const emptyPage = <T,>(): Paged<T> => ({ items: [], total: 0 });

function initialsOf(name: string): string {
  return name.split(/\s+/).map((p) => p[0] ?? "").join("").slice(0, 2).toUpperCase() || "?";
}
function Avatar({ name, className = "", muted = false }: { name: string; className?: string; muted?: boolean }) {
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full font-semibold text-white ${
        muted ? "bg-slate-400" : "bg-gradient-to-br from-brand-400 to-brand-700"
      } ${className}`}
    >
      {initialsOf(name)}
    </span>
  );
}
function when(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(+d) ? "" : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/** The ID/selfie images for one verification record, each viewable and downloadable. */
function ReviewImages({ verificationId, back }: { verificationId: string; back: boolean }) {
  const kinds = [
    { kind: "front", label: "ID front" },
    ...(back ? [{ kind: "back", label: "ID back" }] : []),
    { kind: "selfie", label: "Selfie" },
  ];
  const url = (k: string, dl = false) =>
    `/api/admin/verifications/${verificationId}/image/${k}${dl ? "?download=1" : ""}`;
  return (
    <div className="flex flex-wrap gap-4">
      {kinds.map((img) => (
        <figure key={img.kind} className="text-center">
          <figcaption className="text-[0.6875rem] font-medium text-slate-400">{img.label}</figcaption>
          <a href={url(img.kind)} target="_blank" rel="noreferrer" title="Open full size" className="group">
            {/* Authed same-origin endpoint (secured store); next/image can't optimise it. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url(img.kind)}
              alt={img.label}
              className="mt-1 h-40 w-auto max-w-[16rem] rounded-lg border border-slate-200 bg-slate-50 object-contain transition group-hover:ring-2 group-hover:ring-brand-300"
            />
          </a>
          <a href={url(img.kind, true)} className="mt-1 inline-block text-xs font-semibold text-brand-600 hover:underline">
            Download
          </a>
        </figure>
      ))}
    </div>
  );
}

/** Prev/Next pager with an "x–y of N" readout. Hidden when a single page fits. */
function Pager({ page, total, onPage }: { page: number; total: number; onPage: (p: number) => void }) {
  const pages = Math.ceil(total / PAGE_SIZE);
  if (pages <= 1) return null;
  const from = page * PAGE_SIZE + 1;
  const to = Math.min((page + 1) * PAGE_SIZE, total);
  const btn = "rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-navy-800 transition hover:bg-slate-50 disabled:opacity-40";
  return (
    <div className="mt-6 flex items-center justify-between">
      <span className="text-sm text-slate-500">
        {from}–{to} of {total}
      </span>
      <div className="flex gap-2">
        <button type="button" className={btn} disabled={page === 0} onClick={() => onPage(page - 1)}>
          Previous
        </button>
        <button type="button" className={btn} disabled={page >= pages - 1} onClick={() => onPage(page + 1)}>
          Next
        </button>
      </div>
    </div>
  );
}

/* --------------------------------- panel ---------------------------------- */

export function AdminPanel() {
  const [tab, setTab] = useState<Tab>("ID review");
  const [pages, setPages] = useState<Record<Tab, number>>(
    () => Object.fromEntries(TABS.map((t) => [t, 0])) as Record<Tab, number>,
  );

  const [queue, setQueue] = useState<Paged<Verification>>(emptyPage);
  const [violations, setViolations] = useState<Paged<Violation>>(emptyPage);
  const [blocked, setBlocked] = useState<Paged<BlockedPost>>(emptyPage);
  const [banned, setBanned] = useState<Paged<BannedUser>>(emptyPage);
  const [users, setUsers] = useState<Paged<AdminUser>>(emptyPage);
  const [categories, setCategories] = useState<Category[]>([]);
  const [visitors, setVisitors] = useState<VisitorStats | null>(null);
  const [visits, setVisits] = useState<Paged<VisitRow>>(emptyPage);

  const [userQuery, setUserQuery] = useState("");
  const [userStatus, setUserStatus] = useState("");
  const [detailId, setDetailId] = useState<string | null>(null);
  const [detailData, setDetailData] = useState<UserDetail | null>(null);

  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  // Mirrored in refs so the polling loop reads current values without
  // re-subscribing the interval on every page change or keystroke.
  const pagesRef = useRef(pages);
  const queryRef = useRef(userQuery);
  const statusRef = useRef(userStatus);
  const busyRef = useRef(busyId);
  const tabRef = useRef(tab);
  useEffect(() => {
    pagesRef.current = pages;
    queryRef.current = userQuery;
    statusRef.current = userStatus;
    busyRef.current = busyId;
    tabRef.current = tab;
  });

  const fetchTab = useCallback(
    async (t: Tab, page: number, q = userQuery, status = userStatus, silent = false) => {
      const p = { take: PAGE_SIZE, skip: page * PAGE_SIZE };
      try {
        if (t === "ID review") setQueue((await api.admin.verifications.list(p)) as Paged<Verification>);
        else if (t === "Violations") setViolations((await api.admin.violations(p)) as Paged<Violation>);
        else if (t === "Blocked posts") setBlocked((await api.admin.blockedPosts(p)) as Paged<BlockedPost>);
        else if (t === "Banned users") setBanned((await api.admin.bannedUsers(p)) as Paged<BannedUser>);
        else if (t === "Users") setUsers((await api.admin.users({ ...p, q, status })) as Paged<AdminUser>);
        else if (t === "Analytics") setVisits((await api.admin.analyticsVisits(p)) as Paged<VisitRow>);
      } catch {
        // A failed background poll shouldn't blank the whole panel; only a
        // user-initiated fetch surfaces the error state.
        if (!silent) setLoadError(true);
      }
    },
    [userQuery, userStatus],
  );

  useEffect(() => {
    let live = true;
    Promise.all([
      api.admin.verifications.list({ take: PAGE_SIZE, skip: 0 }),
      api.admin.violations({ take: PAGE_SIZE, skip: 0 }),
      api.admin.blockedPosts({ take: PAGE_SIZE, skip: 0 }),
      api.admin.bannedUsers({ take: PAGE_SIZE, skip: 0 }),
      api.admin.users({ take: PAGE_SIZE, skip: 0 }),
      api.admin.categories.list(),
    ])
      .then(([v, vi, bp, bu, us, cats]) => {
        if (!live) return;
        setQueue(v as Paged<Verification>);
        setViolations(vi as Paged<Violation>);
        setBlocked(bp as Paged<BlockedPost>);
        setBanned(bu as Paged<BannedUser>);
        setUsers(us as Paged<AdminUser>);
        setCategories(cats);
        setLoaded(true);
      })
      .catch(() => {
        if (live) setLoadError(true);
      });
    // Visitor stats and history are non-critical (and the history hits an
    // external IP lookup): fetch them separately so a failure never blanks the
    // whole panel.
    api.admin.analytics().then((v) => live && setVisitors(v as VisitorStats)).catch(() => undefined);
    api.admin
      .analyticsVisits({ take: PAGE_SIZE, skip: 0 })
      .then((v) => live && setVisits(v as Paged<VisitRow>))
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, []);

  // Keep every tab live: re-fetch on an interval while the panel is visible and
  // immediately when the admin returns to it. Each tab refreshes at its current
  // page/filter. Skipped while an action is in flight (so an optimistic update
  // isn't briefly reverted) and silent on failure (a dropped poll never blanks
  // the panel).
  const refreshAll = useCallback(() => {
    if (busyRef.current) return;
    const p = pagesRef.current;
    void fetchTab("ID review", p["ID review"], undefined, undefined, true);
    void fetchTab("Violations", p["Violations"], undefined, undefined, true);
    void fetchTab("Blocked posts", p["Blocked posts"], undefined, undefined, true);
    void fetchTab("Banned users", p["Banned users"], undefined, undefined, true);
    void fetchTab("Users", p["Users"], queryRef.current, statusRef.current, true);
    api.admin.categories.list().then(setCategories).catch(() => {});
    api.admin.analytics().then(setVisitors).catch(() => {});
    // The visit history is only worth polling while its tab is open (each poll
    // may hit the IP-intel lookup), so it's refreshed here only when active.
    if (tabRef.current === "Analytics") void fetchTab("Analytics", p["Analytics"], undefined, undefined, true);
  }, [fetchTab]);

  useEffect(() => {
    if (!loaded) return;
    const onVisible = () => document.visibilityState === "visible" && refreshAll();
    const id = window.setInterval(onVisible, 15000);
    window.addEventListener("focus", refreshAll);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("focus", refreshAll);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [loaded, refreshAll]);

  const counts: Record<Tab, number> = {
    "ID review": queue.total,
    Users: users.total,
    Analytics: visitors?.visitors.total ?? 0,
    Categories: categories.length,
    Violations: violations.total,
    "Blocked posts": blocked.total,
    "Banned users": banned.total,
  };

  function goToPage(t: Tab, p: number) {
    setPages((prev) => ({ ...prev, [t]: p }));
    void fetchTab(t, p);
  }

  /** Runs a mutating action, then refetches the current tab so totals stay right. */
  async function runAction(id: string, fn: () => Promise<unknown>, refetch: Tab) {
    setBusyId(id);
    try {
      await fn();
      await fetchTab(refetch, pages[refetch]);
    } catch (err) {
      window.alert(err instanceof ApiError ? err.message : "That action failed. Try again.");
    } finally {
      setBusyId(null);
    }
  }

  async function decide(id: string, action: "approve" | "reject") {
    await runAction(
      id,
      () => (action === "approve" ? api.admin.verifications.approve(id) : api.admin.verifications.reject(id)),
      "ID review",
    );
  }

  function searchUsers(e: React.FormEvent) {
    e.preventDefault();
    setPages((prev) => ({ ...prev, Users: 0 }));
    void fetchTab("Users", 0, userQuery, userStatus);
  }

  async function viewDetail(id: string) {
    if (detailId === id) {
      setDetailId(null);
      return;
    }
    setDetailId(id);
    setDetailData(null);
    try {
      setDetailData((await api.admin.userDetail(id)) as UserDetail);
    } catch {
      setDetailData(null);
    }
  }

  function confirmDelete(u: AdminUser) {
    if (
      !window.confirm(
        `Permanently delete ${u.fullName} (${u.email})? This removes their profile, posts, chats and files, and can't be undone.`,
      )
    ) {
      return;
    }
    void runAction(u.id, () => api.admin.deleteUser(u.id), tab);
  }

  const smallBtn =
    "rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-navy-800 transition hover:bg-slate-50 disabled:opacity-50";
  const dangerBtn =
    "rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50";
  const verifyBtn =
    "rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50";

  return (
    <div>
      <div className="flex flex-wrap gap-1 border-b border-slate-200">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            aria-current={tab === t ? "page" : undefined}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
              tab === t ? "border-brand-600 text-brand-600" : "border-transparent text-slate-500 hover:text-navy-800"
            }`}
          >
            {t}
            <span
              className={`rounded-full px-2 py-0.5 text-[0.6875rem] font-semibold ${
                tab === t ? "bg-brand-50 text-brand-700" : "bg-slate-100 text-slate-500"
              }`}
            >
              {loaded ? counts[t] : "…"}
            </span>
          </button>
        ))}
      </div>

      {loadError ? (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">
          Couldn&apos;t load this data. Make sure you&apos;re signed in as an admin, then reload.
        </div>
      ) : null}

      {!loaded && !loadError ? (
        <div className="mt-6 space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-slate-50" />
          ))}
        </div>
      ) : null}

      {/* ----------------------------- ID review ----------------------------- */}
      {loaded && tab === "ID review" ? (
        <>
          <ul className="mt-6 space-y-4">
            {queue.items.map((c) => {
              const score = c.score == null ? null : Number(c.score);
              return (
                <li key={c.id} className={`${CARD} p-5`}>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex min-w-0 gap-4">
                      <Avatar name={c.fullName} className="h-10 w-10 text-sm" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-navy-800">{c.fullName}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {c.user?.email} · DOB {c.dob} · ID {c.idNumber}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">Submitted {when(c.createdAt)}</p>
                        {score != null ? (
                          <div className="mt-3 flex items-center gap-3">
                            <span className="text-xs text-slate-400">Match score</span>
                            <span className="h-1.5 w-40 overflow-hidden rounded-full bg-slate-100">
                              <span
                                className={`block h-full rounded-full ${score >= 0.7 ? "bg-amber-400" : "bg-red-400"}`}
                                style={{ width: `${Math.round(score * 100)}%` }}
                              />
                            </span>
                            <span className="text-xs font-semibold text-navy-800">{score.toFixed(2)}</span>
                          </div>
                        ) : (
                          <p className="mt-3 text-xs text-slate-400">Manual review — no automated score.</p>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2">
                      <button type="button" disabled={busyId === c.id} onClick={() => decide(c.id, "reject")} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-navy-800 transition hover:bg-slate-50 disabled:opacity-50">
                        Reject
                      </button>
                      <button type="button" disabled={busyId === c.id} onClick={() => decide(c.id, "approve")} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50">
                        <Check className="h-5 w-5" />
                        Approve
                      </button>
                    </div>
                  </div>

                  <div className="mt-4">
                    <ReviewImages verificationId={c.id} back={!!c.idBackPath} />
                    <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-slate-400">
                      <Lock className="mt-0.5 h-4 w-4 shrink-0" />
                      Confidential — held in secured storage, shown for review only. ID number and date of birth are decrypted here.
                    </p>
                  </div>
                </li>
              );
            })}
            {queue.items.length === 0 ? (
              <li className={`${CARD} p-10 text-center text-sm text-slate-500`}>No pending ID reviews.</li>
            ) : null}
          </ul>
          <Pager page={pages["ID review"]} total={queue.total} onPage={(p) => goToPage("ID review", p)} />
        </>
      ) : null}

      {/* ----------------------------- categories ---------------------------- */}
      {loaded && tab === "Categories" ? (
        <CategoriesManager categories={categories} setCategories={setCategories} />
      ) : null}

      {/* ------------------------------- users ------------------------------- */}
      {loaded && tab === "Users" ? (
        <>
          <form onSubmit={searchUsers} className="mt-6 flex flex-wrap gap-3">
            <input
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              placeholder="Search by name or email"
              className="min-w-[12rem] flex-1 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-navy-800 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
            <Select
              ariaLabel="Filter by status"
              value={userStatus}
              onChange={(v) => {
                setUserStatus(v);
                setPages((prev) => ({ ...prev, Users: 0 }));
                void fetchTab("Users", 0, userQuery, v);
              }}
              options={[
                { value: "", label: "All statuses" },
                { value: "active", label: "Active" },
                { value: "banned", label: "Suspended" },
                { value: "pending", label: "Pending" },
              ]}
              className="w-40"
            />
            <button type="submit" className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700">
              Search
            </button>
          </form>

          <ul className="mt-4 space-y-4">
            {users.items.map((u) => (
              <li key={u.id} className={`${CARD} p-5`}>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-4">
                    <Avatar name={u.fullName} muted={u.status !== "active"} className="h-10 w-10 text-sm" />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-navy-800">{u.fullName}</p>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[0.625rem] font-medium text-slate-500">{u.role}</span>
                        {u.status !== "active" ? (
                          <span className="rounded-full bg-red-100 px-2 py-0.5 text-[0.625rem] font-medium text-red-700">{u.status === "banned" ? "suspended" : u.status}</span>
                        ) : null}
                        {u.phoneVerified ? (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[0.625rem] font-medium text-emerald-700">Phone ✓</span>
                        ) : null}
                        {u.idVerified ? (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[0.625rem] font-medium text-emerald-700">ID ✓</span>
                        ) : null}
                        {u.strikeCount > 0 ? (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[0.625rem] font-medium text-amber-700">{u.strikeCount} strikes</span>
                        ) : null}
                      </div>
                      <p className="mt-1 truncate text-sm text-slate-500">{u.email} · joined {when(u.createdAt)}</p>
                    </div>
                  </div>

                  {u.role === "admin" ? (
                    <span className="shrink-0 text-xs text-slate-400">Admin — protected</span>
                  ) : (
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <button type="button" className={smallBtn} onClick={() => viewDetail(u.id)}>
                        {detailId === u.id ? "Hide" : "View"}
                      </button>
                      {!(u.phoneVerified && u.idVerified) ? (
                        <button type="button" className={verifyBtn} disabled={busyId === u.id} onClick={() => runAction(u.id, () => api.admin.verifyUser(u.id), tab)}>
                          Mark verified
                        </button>
                      ) : null}
                      {u.strikeCount > 0 ? (
                        <button type="button" className={smallBtn} disabled={busyId === u.id} onClick={() => runAction(u.id, () => api.admin.resetStrikes(u.id), tab)}>
                          Reset strikes
                        </button>
                      ) : null}
                      {u.status === "banned" ? (
                        <button type="button" className={smallBtn} disabled={busyId === u.id} onClick={() => runAction(u.id, () => api.admin.reinstate(u.id), tab)}>
                          Reinstate
                        </button>
                      ) : (
                        <button type="button" className={smallBtn} disabled={busyId === u.id} onClick={() => runAction(u.id, () => api.admin.ban(u.id), tab)}>
                          Suspend
                        </button>
                      )}
                      <button type="button" className={dangerBtn} disabled={busyId === u.id} onClick={() => confirmDelete(u)}>
                        {busyId === u.id ? "…" : "Delete"}
                      </button>
                    </div>
                  )}
                </div>

                {detailId === u.id ? (
                  <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600">
                    {detailData ? (
                      <div className="space-y-4">
                        <div className="grid gap-2 sm:grid-cols-2">
                          <span>Phone: {detailData.phone ?? "—"} {detailData.phoneVerified ? "(verified)" : ""}</span>
                          <span>ID verified: {detailData.idVerified ? "yes" : "no"}</span>
                          <span>Location: {[detailData.state, detailData.country].filter(Boolean).join(", ") || "—"}</span>
                          <span>Posts: {detailData.postCount} · Conversations: {detailData.conversationCount}</span>
                          <span>Profile: {detailData.profile ? `/${detailData.profile.slug} (${detailData.profile.isVisible ? "visible" : "hidden"})` : "none"}</span>
                          <span>Latest ID check: {detailData.latestVerification?.status ?? "none"}</span>
                        </div>

                        <div>
                          <p className="mb-2 text-xs font-semibold text-slate-500">Contact info</p>
                          <div className="grid gap-2 sm:grid-cols-2">
                            <span>Email: <span className="text-navy-800">{detailData.email}</span></span>
                            <span>Phone: <span className="text-navy-800">{detailData.phone ?? "—"}</span></span>
                            <span>Telegram: <span className="text-navy-800">{detailData.profile?.contactTelegram ?? "—"}</span></span>
                            <span>WhatsApp: <span className="text-navy-800">{detailData.profile?.contactWhatsapp ?? "—"}</span></span>
                            <span>Discord: <span className="text-navy-800">{detailData.profile?.contactDiscord ?? "—"}</span></span>
                            <span>LinkedIn: <span className="text-navy-800">{detailData.profile?.contactLinkedin ?? "—"}</span></span>
                          </div>
                        </div>

                        <div>
                          <p className="mb-2 text-xs font-semibold text-slate-500">IP &amp; sign-in</p>
                          <div className="grid gap-2 sm:grid-cols-2">
                            <span className="flex flex-wrap items-center gap-2">
                              Sign-up IP:
                              <IpWithFlags ip={detailData.signupIp} intel={detailData.signupIp ? detailData.ipIntel?.[detailData.signupIp] : undefined} />
                            </span>
                            <span className="flex flex-wrap items-center gap-2">
                              Last login IP:
                              <IpWithFlags ip={detailData.lastLoginIp} intel={detailData.lastLoginIp ? detailData.ipIntel?.[detailData.lastLoginIp] : undefined} />
                            </span>
                            <span>Last login: {detailData.lastLoginAt ? fmtDateTime(detailData.lastLoginAt) : "—"}</span>
                          </div>
                        </div>

                        {detailData.latestVerification ? (
                          <div>
                            <p className="mb-2 text-xs font-semibold text-slate-500">ID &amp; selfie ({detailData.latestVerification.status})</p>
                            <ReviewImages verificationId={detailData.latestVerification.id} back={detailData.latestVerification.hasBack} />
                          </div>
                        ) : null}

                        {detailData.profile?.photoPath ? (
                          <div>
                            <p className="mb-2 text-xs font-semibold text-slate-500">Profile photo</p>
                            <figure className="inline-block text-center">
                              <a href={detailData.profile.photoPath} target="_blank" rel="noreferrer" title="Open full size">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={detailData.profile.photoPath} alt="Profile photo" className="h-32 w-32 rounded-lg border border-slate-200 object-cover" />
                              </a>
                              <a href={detailData.profile.photoPath} download className="mt-1 block text-xs font-semibold text-brand-600 hover:underline">
                                Download
                              </a>
                            </figure>
                          </div>
                        ) : null}
                      </div>
                    ) : (
                      <span className="text-slate-400">Loading…</span>
                    )}
                  </div>
                ) : null}
              </li>
            ))}
            {users.items.length === 0 ? (
              <li className={`${CARD} p-10 text-center text-sm text-slate-500`}>No users match.</li>
            ) : null}
          </ul>
          <Pager page={pages.Users} total={users.total} onPage={(p) => goToPage("Users", p)} />
        </>
      ) : null}

      {/* ----------------------------- analytics ----------------------------- */}
      {loaded && tab === "Analytics" ? (
        <div className="mt-6 space-y-6">
          {visitors ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard label="Visitors today" value={visitors.visitors.today} />
                <StatCard label="All-time visitors" value={visitors.visitors.total} />
                <StatCard label="Registered today" value={visitors.registered.today} />
                <StatCard label="All-time registered" value={visitors.registered.total} />
                <StatCard label="Verified today" value={visitors.verified.today} />
                <StatCard label="All-time verified" value={visitors.verified.total} />
                <StatCard label="Logged in today" value={visitors.logins.today} />
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <DailyBarChart title="Visitors — last 30 days" daily={visitors.visitors.daily} unit="visitor" />
                <DailyBarChart
                  title="New signups — last 30 days"
                  daily={visitors.registered.daily}
                  unit="signup"
                  barClass="bg-emerald-500 group-hover:bg-emerald-600"
                />
                <DailyBarChart
                  title="Verifications — last 30 days"
                  daily={visitors.verified.daily}
                  unit="verification"
                  barClass="bg-violet-500 group-hover:bg-violet-600"
                />
                <DailyBarChart
                  title="Logins — last 30 days"
                  daily={visitors.logins.daily}
                  unit="login"
                  barClass="bg-amber-500 group-hover:bg-amber-600"
                />
              </div>
            </>
          ) : (
            <div className={`${CARD} p-6 text-sm text-slate-500`}>Analytics aren&apos;t available yet.</div>
          )}

          <div>
            <h3 className="mb-1 text-sm font-semibold text-navy-800">Visitor history</h3>
            <p className="mb-3 text-xs text-slate-500">
              One row per visitor per day, newest first. IP type (VPS / VPN / proxy) is looked up the first
              time you view a row, then cached.
            </p>
            <div className={`${CARD} overflow-hidden`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                      <th className="px-4 py-3 font-medium">When</th>
                      <th className="px-4 py-3 font-medium">IP address</th>
                      <th className="px-4 py-3 font-medium">Type</th>
                      <th className="px-4 py-3 font-medium">Country</th>
                      <th className="px-4 py-3 font-medium">Device</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visits.items.map((v) => (
                      <tr key={v.id} className="border-b border-slate-50 align-top last:border-0">
                        <td className="whitespace-nowrap px-4 py-3 text-slate-600">{fmtDateTime(v.at)}</td>
                        <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-navy-800">{v.ip ?? "—"}</td>
                        <td className="px-4 py-3"><IpTypeBadges v={v} /></td>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-600">{v.country ?? "—"}</td>
                        <td className="max-w-[16rem] truncate px-4 py-3 text-slate-500" title={v.userAgent ?? undefined}>
                          {v.userAgent ?? "—"}
                        </td>
                      </tr>
                    ))}
                    {visits.items.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-10 text-center text-slate-500">No visits recorded yet.</td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </div>
            <Pager page={pages.Analytics} total={visits.total} onPage={(p) => goToPage("Analytics", p)} />
          </div>
        </div>
      ) : null}

      {/* ----------------------------- violations ---------------------------- */}
      {loaded && tab === "Violations" ? (
        <>
          <ul className="mt-6 space-y-4">
            {violations.items.map((v) => (
              <li key={v.id} className={`${CARD} p-5`}>
                <div className="flex min-w-0 gap-4">
                  <Avatar name={v.user?.fullName ?? "?"} className="h-10 w-10 text-sm" />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-navy-800">{v.user?.fullName}</p>
                      {v.user ? (
                        <span
                          className={`rounded-full px-2 py-0.5 text-[0.6875rem] font-semibold ring-1 ${
                            v.user.status === "banned"
                              ? "bg-slate-100 text-slate-600 ring-slate-200"
                              : v.user.strikeCount >= 2
                                ? "bg-red-50 text-red-700 ring-red-200"
                                : "bg-amber-50 text-amber-700 ring-amber-200"
                          }`}
                        >
                          {v.user.status === "banned" ? "Suspended" : `Strike ${v.user.strikeCount} of 3`}
                        </span>
                      ) : null}
                    </div>
                    {v.post?.title ? <p className="mt-1 truncate text-sm text-slate-500">{v.post.title}</p> : null}
                    <p className="mt-2.5 text-sm text-slate-600">
                      <mark className="rounded bg-red-100 px-1 text-red-900">{v.detectedText}</mark>
                    </p>
                    <p className="mt-2 text-xs text-slate-400">{when(v.createdAt)}</p>
                  </div>
                </div>
              </li>
            ))}
            {violations.items.length === 0 ? (
              <li className={`${CARD} p-10 text-center text-sm text-slate-500`}>No violations recorded.</li>
            ) : null}
          </ul>
          <Pager page={pages.Violations} total={violations.total} onPage={(p) => goToPage("Violations", p)} />
        </>
      ) : null}

      {/* --------------------------- blocked posts --------------------------- */}
      {loaded && tab === "Blocked posts" ? (
        <>
          <ul className="mt-6 space-y-4">
            {blocked.items.map((p) => (
              <li key={p.id} className={`${CARD} p-5`}>
                <p className="font-semibold text-navy-800">{p.title}</p>
                {p.author ? <p className="mt-0.5 text-xs text-slate-400">{p.author.fullName} · {p.author.email}</p> : null}
                <p className="mt-1.5 line-clamp-2 max-w-2xl text-sm leading-relaxed text-slate-500">{p.description}</p>
                {p.blockedReason ? (
                  <p className="mt-2.5 text-sm text-slate-600">
                    <span className="text-slate-400">Detected:</span>{" "}
                    <mark className="rounded bg-red-100 px-1 text-red-900">{p.blockedReason}</mark>
                  </p>
                ) : null}
                <p className="mt-2 text-xs text-slate-400">
                  The author fixes and republishes this themselves — removing the contact details clears the block.
                </p>
              </li>
            ))}
            {blocked.items.length === 0 ? (
              <li className={`${CARD} p-10 text-center text-sm text-slate-500`}>Nothing blocked.</li>
            ) : null}
          </ul>
          <Pager page={pages["Blocked posts"]} total={blocked.total} onPage={(p) => goToPage("Blocked posts", p)} />
        </>
      ) : null}

      {/* --------------------------- banned users ---------------------------- */}
      {loaded && tab === "Banned users" ? (
        <>
          <ul className="mt-6 space-y-4">
            {banned.items.map((b) => (
              <li key={b.id} className={`${CARD} p-5`}>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-4">
                    <Avatar name={b.fullName} muted className="h-10 w-10 text-sm" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-navy-800">{b.fullName}</p>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[0.625rem] font-medium text-slate-500">{b.role}</span>
                      </div>
                      <p className="mt-1 text-sm text-slate-500">{b.email} · {b.strikeCount} strikes</p>
                    </div>
                  </div>
                  <button type="button" disabled={busyId === b.id} onClick={() => runAction(b.id, () => api.admin.reinstate(b.id), "Banned users")} className="shrink-0 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-navy-800 transition hover:bg-slate-50 disabled:opacity-50">
                    Reinstate
                  </button>
                </div>
              </li>
            ))}
            {banned.items.length === 0 ? (
              <li className={`${CARD} p-10 text-center text-sm text-slate-500`}>Nobody is suspended.</li>
            ) : null}
          </ul>
          <Pager page={pages["Banned users"]} total={banned.total} onPage={(p) => goToPage("Banned users", p)} />
        </>
      ) : null}

      <p className="mt-8 flex items-start gap-2 text-sm leading-relaxed text-slate-500">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
        Every action here is enforced server-side. Strikes and the three-strike ban are applied
        automatically; this screen is for ID review, users, the category taxonomy, and oversight.
      </p>
    </div>
  );
}

/* --------------------------- categories manager --------------------------- */

function CategoriesManager({
  categories,
  setCategories,
}: {
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
}) {
  const [newName, setNewName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function add() {
    const name = newName.trim();
    if (!name) return;
    setBusy(true);
    setError(null);
    try {
      const created = await api.admin.categories.create({ name });
      setCategories((cs) => [...cs, created].sort((a, b) => a.sortOrder - b.sortOrder));
      setNewName("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't add the category.");
    } finally {
      setBusy(false);
    }
  }

  async function toggle(c: Category) {
    try {
      const updated = await api.admin.categories.update(c.id, { isActive: !c.isActive });
      setCategories((cs) => cs.map((x) => (x.id === c.id ? updated : x)));
    } catch {
      /* no-op */
    }
  }

  async function remove(id: string) {
    try {
      await api.admin.categories.remove(id);
      setCategories((cs) => cs.filter((x) => x.id !== id));
    } catch {
      /* no-op */
    }
  }

  return (
    <div className="mt-6">
      <div className={`${CARD} p-5`}>
        <h2 className="text-sm font-bold text-navy-800">Add a category</h2>
        <div className="mt-3 flex gap-3">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="e.g. Pet Care & Walking"
            className="flex-1 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-navy-800 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
          <button
            type="button"
            onClick={add}
            disabled={busy || !newName.trim()}
            className="shrink-0 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
          >
            Add
          </button>
        </div>
        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
      </div>

      <ul className="mt-4 space-y-2">
        {categories.map((c) => (
          <li key={c.id} className={`${CARD} flex items-center justify-between gap-4 px-5 py-3`}>
            <div className="flex items-center gap-3">
              <span className={`text-sm font-medium ${c.isActive ? "text-navy-800" : "text-slate-400 line-through"}`}>
                {c.name}
              </span>
              <span className="text-xs text-slate-400">/{c.slug}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => toggle(c)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-navy-800 transition hover:bg-slate-50"
              >
                {c.isActive ? "Hide" : "Show"}
              </button>
              <button
                type="button"
                onClick={() => remove(c.id)}
                className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
