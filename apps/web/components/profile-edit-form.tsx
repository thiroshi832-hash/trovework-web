"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Portrait } from "@/components/brand";
import { Field, PendingNotice, SelectInput, TextInput } from "@/components/auth-fields";
import { Check, ShieldCheck } from "@/components/icons";
import { AVAILABILITY, CATEGORIES } from "@/lib/categories";
import { COUNTRIES } from "@/components/auth-fields";
import { CURRENT_FREELANCER } from "@/lib/session";

const BIO_MAX = 600;
const HEADLINE_MAX = 70;
const SKILL_MAX = 12;

const ME = CURRENT_FREELANCER;

type Errors = Partial<Record<"name" | "headline" | "rate" | "bio", string>>;

export function ProfileEditForm() {
  const [name, setName] = useState(ME.name);
  const [headline, setHeadline] = useState(ME.title);
  const [bio, setBio] = useState(ME.about);
  const [category, setCategory] = useState<string>(ME.category);
  const [availability, setAvailability] = useState<string>(ME.availability);
  const [country, setCountry] = useState(ME.country);
  const [rate, setRate] = useState(String(ME.rate));
  const [skills, setSkills] = useState<string[]>(ME.allSkills);
  const [skillDraft, setSkillDraft] = useState("");
  const [telegram, setTelegram] = useState("");
  const [discord, setDiscord] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [saved, setSaved] = useState(false);
  const resumeInput = useRef<HTMLInputElement>(null);

  function addSkill() {
    const s = skillDraft.trim();
    if (!s || skills.length >= SKILL_MAX) return;
    if (!skills.some((x) => x.toLowerCase() === s.toLowerCase())) setSkills([...skills, s]);
    setSkillDraft("");
  }

  function validate(): Errors {
    const next: Errors = {};
    if (!name.trim()) next.name = "Enter the name clients will see.";
    if (!headline.trim()) next.headline = "Add a short professional title.";
    else if (headline.length > HEADLINE_MAX) next.headline = `Keep this under ${HEADLINE_MAX} characters.`;
    const r = Number(rate);
    if (rate.trim() === "" || Number.isNaN(r)) next.rate = "Enter your hourly rate.";
    else if (r <= 0) next.rate = "Your rate must be more than 0.";
    if (bio.length > BIO_MAX) next.bio = `Keep this under ${BIO_MAX} characters.`;
    return next;
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    setSaved(Object.keys(next).length === 0);
  }

  const section = "rounded-2xl border border-slate-200 bg-white p-6 sm:p-8";

  return (
    <form noValidate onSubmit={onSubmit} className="space-y-6">
      {/* The API keeps is_visible = false until identity verification passes, so
          say which side of that gate this profile is on rather than assuming. */}
      {ME.idVerified ? (
        <div className="flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <ShieldCheck className="h-6 w-6 shrink-0 text-emerald-600" />
          <div>
            <p className="text-sm font-semibold text-emerald-900">Your profile is live</p>
            <p className="mt-1 text-sm leading-relaxed text-emerald-800">
              You are verified, so these details are what clients see in search results.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <ShieldCheck className="h-6 w-6 shrink-0 text-amber-600" />
            <div>
              <p className="text-sm font-semibold text-amber-900">Your profile is hidden</p>
              <p className="mt-1 text-sm leading-relaxed text-amber-800">
                Freelancer profiles stay out of search results until identity verification passes.
              </p>
            </div>
          </div>
          <Link
            href="/verify/id"
            className="shrink-0 rounded-lg bg-amber-600 px-5 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-amber-700"
          >
            Verify my identity
          </Link>
        </div>
      )}

      {/* ------------------------------- basics ------------------------------ */}
      <section className={section}>
        <h2 className="text-lg font-bold text-navy-800">Basics</h2>
        <p className="mt-1 text-sm text-slate-500">How you appear across Trovework.</p>

        <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center">
          <Portrait src={ME.photo} sizes="96px" className="h-24 w-24" />
          <div>
            <p className="text-sm font-medium text-navy-800">Profile photo</p>
            <p className="mt-1 text-sm text-slate-500">JPG or PNG, at least 200×200.</p>
            <button
              type="button"
              className="mt-3 rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-navy-800 transition hover:bg-slate-50"
            >
              Change photo
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Field label="Display name" error={errors.name}>
            <TextInput
              value={name}
              onChange={(e) => setName(e.target.value)}
              invalid={!!errors.name}
              placeholder="Your name as clients see it"
              autoComplete="name"
            />
          </Field>

          <Field label="Professional title" error={errors.headline}>
            <TextInput
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              invalid={!!errors.headline}
              maxLength={HEADLINE_MAX + 20}
              placeholder="e.g. Full Stack Developer"
            />
          </Field>

          <Field label="Category">
            <SelectInput value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </SelectInput>
          </Field>

          <Field label="Country">
            <SelectInput value={country} onChange={(e) => setCountry(e.target.value)}>
              {COUNTRIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </SelectInput>
          </Field>
        </div>

        <div className="mt-5">
          <Field label="About you" error={errors.bio}>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={6}
              aria-invalid={!!errors.bio || undefined}
              placeholder="What you do, who you do it for, and what makes your work good."
              className={`w-full rounded-lg border bg-white px-3.5 py-3 text-base leading-relaxed text-navy-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                errors.bio
                  ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                  : "border-slate-200 focus:border-brand-500 focus:ring-brand-100"
              }`}
            />
          </Field>
          <p className={`mt-1.5 text-right text-xs ${bio.length > BIO_MAX ? "text-red-600" : "text-slate-400"}`}>
            {bio.length}/{BIO_MAX}
          </p>
        </div>
      </section>

      {/* -------------------------- skills and rate -------------------------- */}
      <section className={section}>
        <h2 className="text-lg font-bold text-navy-800">Skills &amp; rate</h2>
        <p className="mt-1 text-sm text-slate-500">
          Skills are how clients filter search, so list the ones you want work in.
        </p>

        <div className="mt-6">
          <Field label={`Skills (${skills.length}/${SKILL_MAX})`}>
            <div className="flex gap-3">
              <TextInput
                value={skillDraft}
                onChange={(e) => setSkillDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSkill();
                  }
                }}
                disabled={skills.length >= SKILL_MAX}
                placeholder="Add a skill and press Enter"
              />
              <button
                type="button"
                onClick={addSkill}
                disabled={!skillDraft.trim() || skills.length >= SKILL_MAX}
                className="shrink-0 rounded-lg border border-brand-200 px-5 text-sm font-semibold text-brand-600 transition hover:bg-brand-50 disabled:border-slate-200 disabled:text-slate-300"
              >
                Add
              </button>
            </div>
          </Field>

          <ul className="mt-3 flex flex-wrap gap-2">
            {skills.map((s) => (
              <li key={s}>
                <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 py-1 pl-2.5 pr-1.5 text-xs text-slate-600">
                  {s}
                  <button
                    type="button"
                    onClick={() => setSkills(skills.filter((x) => x !== s))}
                    aria-label={`Remove ${s}`}
                    className="grid h-4 w-4 place-items-center rounded-full text-slate-400 transition hover:bg-slate-200 hover:text-navy-800"
                  >
                    ×
                  </button>
                </span>
              </li>
            ))}
            {skills.length === 0 ? <li className="text-sm text-slate-400">No skills yet.</li> : null}
          </ul>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Field label="Hourly rate (USD)" error={errors.rate}>
            <span className="relative block">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-base text-slate-400">
                $
              </span>
              <input
                type="number"
                min={1}
                inputMode="numeric"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                aria-invalid={!!errors.rate || undefined}
                className={`w-full rounded-lg border bg-white py-3 pl-8 pr-3.5 text-base text-navy-800 focus:outline-none focus:ring-2 ${
                  errors.rate
                    ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                    : "border-slate-200 focus:border-brand-500 focus:ring-brand-100"
                }`}
              />
            </span>
          </Field>

          <Field label="Availability">
            <SelectInput value={availability} onChange={(e) => setAvailability(e.target.value)}>
              {AVAILABILITY.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </SelectInput>
          </Field>
        </div>

        <div className="mt-5">
          <p className="mb-2 block text-base font-medium text-navy-800">Resume</p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => resumeInput.current?.click()}
              className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-navy-800 transition hover:bg-slate-50"
            >
              {resume ? "Replace file" : "Upload resume"}
            </button>
            <span className="text-sm text-slate-500">
              {resume ? `${resume.name} (${(resume.size / 1024).toFixed(0)} KB)` : "PDF or DOCX, up to 5MB."}
            </span>
            <input
              ref={resumeInput}
              type="file"
              accept=".pdf,.doc,.docx"
              className="sr-only"
              onChange={(e) => setResume(e.target.files?.[0] ?? null)}
            />
          </div>
        </div>
      </section>

      {/* ------------------------------ contact ------------------------------ */}
      <section className={section}>
        <h2 className="text-lg font-bold text-navy-800">Contact details</h2>
        <div className="mt-3 flex gap-3 rounded-lg bg-brand-50 p-4">
          <ShieldCheck className="h-5 w-5 shrink-0 text-brand-600" />
          <p className="text-sm leading-relaxed text-brand-800">
            These are never shown on your public profile. The server releases them only to clients
            who have completed identity verification.
          </p>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-3">
          <Field label="Telegram">
            <TextInput value={telegram} onChange={(e) => setTelegram(e.target.value)} placeholder="@username" />
          </Field>
          <Field label="Discord">
            <TextInput value={discord} onChange={(e) => setDiscord(e.target.value)} placeholder="username" />
          </Field>
          <Field label="WhatsApp">
            <TextInput
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="+1 555 123 4567"
              inputMode="tel"
            />
          </Field>
        </div>
      </section>

      {saved ? (
        <PendingNotice>
          Nothing was saved — the profiles API does not exist yet, so this form has nowhere to write.
          Your changes stay on this page only.
        </PendingNotice>
      ) : null}

      <div className="flex flex-wrap items-center justify-end gap-3">
        <Link
          href={`/freelancers/${ME.slug}`}
          className="rounded-lg border border-slate-200 px-6 py-3 text-sm font-semibold text-navy-800 transition hover:bg-slate-50"
        >
          View public profile
        </Link>
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-8 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          <Check className="h-4 w-4" />
          Save changes
        </button>
      </div>
    </form>
  );
}
