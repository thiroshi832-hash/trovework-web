"use client";

import { useEffect, useState } from "react";
import { Check, Lock, ShieldCheck } from "@/components/icons";
import { ApiError, api, type Category } from "@/lib/api";

const TABS = ["ID review", "Users", "Categories", "Violations", "Blocked posts", "Banned users"] as const;
type Tab = (typeof TABS)[number];

const CARD = "rounded-2xl border border-slate-200 bg-white";

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
  phoneVerified: boolean;
  idVerified: boolean;
  createdAt: string;
}

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

/* --------------------------------- panel ---------------------------------- */

export function AdminPanel() {
  const [tab, setTab] = useState<Tab>("ID review");

  const [queue, setQueue] = useState<Verification[]>([]);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [blocked, setBlocked] = useState<BlockedPost[]>([]);
  const [banned, setBanned] = useState<BannedUser[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    Promise.all([
      api.admin.verifications.list(),
      api.admin.violations(),
      api.admin.blockedPosts(),
      api.admin.bannedUsers(),
      api.admin.categories.list(),
      api.admin.users(),
    ])
      .then(([v, vi, bp, bu, cats, us]) => {
        if (!live) return;
        setQueue(v as Verification[]);
        setViolations(vi as Violation[]);
        setBlocked(bp as BlockedPost[]);
        setBanned(bu as BannedUser[]);
        setCategories(cats);
        setUsers(us as AdminUser[]);
        setLoaded(true);
      })
      .catch(() => {
        if (live) setLoadError(true);
      });
    return () => {
      live = false;
    };
  }, []);

  const counts: Record<Tab, number> = {
    "ID review": queue.length,
    Users: users.length,
    Categories: categories.length,
    Violations: violations.length,
    "Blocked posts": blocked.length,
    "Banned users": banned.length,
  };

  async function decide(id: string, action: "approve" | "reject") {
    setBusyId(id);
    try {
      if (action === "approve") await api.admin.verifications.approve(id);
      else await api.admin.verifications.reject(id);
      setQueue((q) => q.filter((v) => v.id !== id));
    } catch {
      /* surfaced by leaving the row in place; a reload re-syncs */
    } finally {
      setBusyId(null);
    }
  }

  async function reinstate(id: string) {
    setBusyId(id);
    try {
      await api.admin.reinstate(id);
      setBanned((b) => b.filter((u) => u.id !== id));
    } catch {
      /* no-op */
    } finally {
      setBusyId(null);
    }
  }

  async function deleteUser(u: AdminUser) {
    // Deleting is permanent and cascades away all their data — make it deliberate.
    if (!window.confirm(`Permanently delete ${u.fullName} (${u.email})? This removes their profile, posts, chats and files, and can't be undone.`)) {
      return;
    }
    setBusyId(u.id);
    try {
      await api.admin.deleteUser(u.id);
      setUsers((list) => list.filter((x) => x.id !== u.id));
      setBanned((list) => list.filter((x) => x.id !== u.id));
    } catch (err) {
      window.alert(err instanceof ApiError ? err.message : "Couldn't delete that user. Try again.");
    } finally {
      setBusyId(null);
    }
  }

  if (loadError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        We couldn&apos;t load the moderation data. Make sure you&apos;re signed in as an admin, then refresh.
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 border-b border-slate-200">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            aria-current={tab === t ? "page" : undefined}
            className={`-mb-px flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition ${
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

      {!loaded ? (
        <div className="mt-6 space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-slate-50" />
          ))}
        </div>
      ) : null}

      {/* ----------------------------- ID review ----------------------------- */}
      {loaded && tab === "ID review" ? (
        <ul className="mt-6 space-y-4">
          {queue.map((c) => {
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
                    <button
                      type="button"
                      disabled={busyId === c.id}
                      onClick={() => decide(c.id, "reject")}
                      className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-navy-800 transition hover:bg-slate-50 disabled:opacity-50"
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      disabled={busyId === c.id}
                      onClick={() => decide(c.id, "approve")}
                      className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                    >
                      <Check className="h-5 w-5" />
                      Approve
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex flex-wrap gap-3">
                    {[
                      { kind: "front", label: "ID front" },
                      ...(c.idBackPath ? [{ kind: "back", label: "ID back" }] : []),
                      { kind: "selfie", label: "Selfie" },
                    ].map((img) => (
                      <a
                        key={img.kind}
                        href={`/api/admin/verifications/${c.id}/image/${img.kind}`}
                        target="_blank"
                        rel="noreferrer"
                        className="group"
                        title="Open full size"
                      >
                        <span className="block text-[0.6875rem] font-medium text-slate-400">{img.label}</span>
                        {/* Authed same-origin endpoint (secured store); next/image can't optimise it. */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`/api/admin/verifications/${c.id}/image/${img.kind}`}
                          alt={img.label}
                          className="mt-1 h-40 w-auto max-w-[16rem] rounded-lg border border-slate-200 bg-slate-50 object-contain transition group-hover:ring-2 group-hover:ring-brand-300"
                        />
                      </a>
                    ))}
                  </div>
                  <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-slate-400">
                    <Lock className="mt-0.5 h-4 w-4 shrink-0" />
                    Confidential — held in secured storage, shown for review only. ID number and date of
                    birth are decrypted here.
                  </p>
                </div>
              </li>
            );
          })}
          {queue.length === 0 ? (
            <li className={`${CARD} p-10 text-center text-sm text-slate-500`}>No pending ID reviews.</li>
          ) : null}
        </ul>
      ) : null}

      {/* ----------------------------- categories ---------------------------- */}
      {loaded && tab === "Categories" ? (
        <CategoriesManager categories={categories} setCategories={setCategories} />
      ) : null}

      {/* ----------------------------- violations ---------------------------- */}
      {loaded && tab === "Violations" ? (
        <ul className="mt-6 space-y-4">
          {violations.map((v) => (
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
                        {v.user.status === "banned" ? "Banned" : `Strike ${v.user.strikeCount} of 3`}
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
          {violations.length === 0 ? (
            <li className={`${CARD} p-10 text-center text-sm text-slate-500`}>No violations recorded.</li>
          ) : null}
        </ul>
      ) : null}

      {/* --------------------------- blocked posts --------------------------- */}
      {loaded && tab === "Blocked posts" ? (
        <ul className="mt-6 space-y-4">
          {blocked.map((p) => (
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
          {blocked.length === 0 ? (
            <li className={`${CARD} p-10 text-center text-sm text-slate-500`}>Nothing blocked.</li>
          ) : null}
        </ul>
      ) : null}

      {/* --------------------------- banned users ---------------------------- */}
      {loaded && tab === "Banned users" ? (
        <ul className="mt-6 space-y-4">
          {banned.map((b) => (
            <li key={b.id} className={`${CARD} p-5`}>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-4">
                  <Avatar name={b.fullName} muted className="h-10 w-10 text-sm" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-navy-800">{b.fullName}</p>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[0.625rem] font-medium text-slate-500">
                        {b.role}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">{b.email} · {b.strikeCount} strikes</p>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={busyId === b.id}
                  onClick={() => reinstate(b.id)}
                  className="shrink-0 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-navy-800 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Reinstate
                </button>
              </div>
            </li>
          ))}
          {banned.length === 0 ? (
            <li className={`${CARD} p-10 text-center text-sm text-slate-500`}>Nobody is banned.</li>
          ) : null}
        </ul>
      ) : null}

      {/* ------------------------------- users ------------------------------- */}
      {loaded && tab === "Users" ? (
        <ul className="mt-6 space-y-4">
          {users.map((u) => (
            <li key={u.id} className={`${CARD} p-5`}>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-4">
                  <Avatar name={u.fullName} muted={u.status !== "active"} className="h-10 w-10 text-sm" />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-navy-800">{u.fullName}</p>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[0.625rem] font-medium text-slate-500">
                        {u.role}
                      </span>
                      {u.status !== "active" ? (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-[0.625rem] font-medium text-red-700">
                          {u.status}
                        </span>
                      ) : null}
                      {u.idVerified ? (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[0.625rem] font-medium text-emerald-700">
                          ID ✓
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 truncate text-sm text-slate-500">
                      {u.email} · joined {when(u.createdAt)}
                    </p>
                  </div>
                </div>
                {u.role === "admin" ? (
                  <span className="shrink-0 text-xs text-slate-400">Admin — protected</span>
                ) : (
                  <button
                    type="button"
                    disabled={busyId === u.id}
                    onClick={() => deleteUser(u)}
                    className="shrink-0 rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                  >
                    {busyId === u.id ? "Deleting…" : "Delete"}
                  </button>
                )}
              </div>
            </li>
          ))}
          {users.length === 0 ? (
            <li className={`${CARD} p-10 text-center text-sm text-slate-500`}>No users yet.</li>
          ) : null}
        </ul>
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
