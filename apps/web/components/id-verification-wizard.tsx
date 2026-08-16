"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Field, PendingNotice, TextInput } from "@/components/auth-fields";
import { ArrowLeft, Check, IdUpload, ShieldCheck } from "@/components/icons";

const STEPS = ["Upload ID", "Take Selfie", "Your Info", "Review"] as const;
const IMAGE_TYPES = ["image/jpeg", "image/png"];
const MAX_BYTES = 5 * 1024 * 1024;

type Shot = { url: string; name: string };
type Info = { fullName: string; dob: string; idNumber: string };

/** Reads an image File to a data URL, or returns why it was rejected. */
function readImage(file: File): Promise<{ shot?: Shot; error?: string }> {
  if (!IMAGE_TYPES.includes(file.type)) {
    return Promise.resolve({ error: "That file type isn't supported. Upload a JPG or PNG." });
  }
  if (file.size > MAX_BYTES) {
    return Promise.resolve({ error: "That file is over the 5MB limit." });
  }
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ shot: { url: String(reader.result), name: file.name } });
    reader.onerror = () => resolve({ error: "That file could not be read." });
    reader.readAsDataURL(file);
  });
}

/* -------------------------------- stepper -------------------------------- */

function Stepper({ step, onJump }: { step: number; onJump: (i: number) => void }) {
  return (
    <ol className="flex items-center border-b border-slate-200 pb-6">
      {STEPS.map((label, i) => {
        const done = i < step;
        const current = i === step;
        return (
          <li key={label} className={`flex items-center ${i < STEPS.length - 1 ? "flex-1" : ""}`}>
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                disabled={!done}
                onClick={() => onJump(i)}
                aria-current={current ? "step" : undefined}
                aria-label={done ? `Back to ${label}` : label}
                className={`grid h-8 w-8 place-items-center rounded-full text-sm font-semibold transition ${
                  done
                    ? "bg-brand-100 text-brand-700 hover:bg-brand-200"
                    : current
                      ? "bg-brand-600 text-white"
                      : "bg-slate-100 text-slate-400"
                }`}
              >
                {done ? <Check className="h-4 w-4" /> : i + 1}
              </button>
              <span
                className={`text-xs ${current ? "font-semibold text-brand-600" : done ? "text-brand-600" : "text-slate-400"}`}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 ? (
              <span className={`mx-2 h-px flex-1 ${done ? "bg-brand-200" : "bg-slate-200"}`} />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

/* ------------------------------ shared shell ------------------------------ */

function StepHeader({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <h1 className="mt-7 text-2xl font-bold tracking-tight text-navy-800 sm:text-3xl">{title}</h1>
      <p className="mt-3 text-base leading-relaxed text-slate-500">{children}</p>
    </>
  );
}

function Dropzone({
  onFile,
  error,
  className = "mt-6 px-6 py-12",
  children,
}: {
  onFile: (f: File | undefined) => void;
  error: string | null;
  className?: string;
  children: React.ReactNode;
}) {
  const [dragging, setDragging] = useState(false);
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        onFile(e.dataTransfer.files[0]);
      }}
      className={`rounded-xl border-2 border-dashed text-center transition ${className} ${
        dragging
          ? "border-brand-500 bg-brand-50"
          : error
            ? "border-red-300 bg-red-50/40"
            : "border-brand-200 bg-white"
      }`}
    >
      {children}
    </div>
  );
}

function Preview({ shot, onClear, label }: { shot: Shot; onClear: () => void; label: string }) {
  return (
    <>
      <div className="relative mx-auto h-40 w-64 overflow-hidden rounded-lg ring-1 ring-slate-200">
        {/* A local data URL, so next/image optimisation is neither possible nor wanted. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={shot.url} alt={label} className="h-full w-full object-cover" />
      </div>
      <p className="mt-4 truncate font-semibold text-navy-800">{shot.name}</p>
      <button
        type="button"
        onClick={onClear}
        className="mt-4 rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-navy-800 transition hover:bg-slate-50"
      >
        Retake or choose another
      </button>
    </>
  );
}

/** One face of the document — cards need two, a passport only its photo page. */
function DocSide({
  label,
  shot,
  error,
  onFile,
  onClear,
}: {
  label: string;
  shot: Shot | null;
  error: string | null;
  onFile: (f: File | undefined) => void;
  onClear: () => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-navy-800">{label}</p>
      <Dropzone error={error} onFile={onFile} className="px-4 py-8">
        {shot ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={shot.url}
              alt={label}
              className="mx-auto h-28 w-44 rounded-lg object-cover ring-1 ring-slate-200"
            />
            <p className="mt-3 truncate text-sm font-semibold text-navy-800">{shot.name}</p>
            <button
              type="button"
              onClick={onClear}
              className="mt-3 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-navy-800 transition hover:bg-slate-50"
            >
              Replace
            </button>
          </>
        ) : (
          <>
            <IdUpload className="mx-auto h-10 w-10 text-brand-600" />
            <p className="mt-3 text-sm text-slate-500">Drag &amp; drop, or</p>
            <button
              type="button"
              onClick={() => input.current?.click()}
              className="mt-2.5 rounded-lg bg-brand-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              Choose file
            </button>
          </>
        )}
        <input
          ref={input}
          type="file"
          aria-label={`Upload the ${label.toLowerCase()} of your ID card`}
          accept={IMAGE_TYPES.join(",")}
          className="sr-only"
          onChange={(e) => onFile(e.target.files?.[0])}
        />
      </Dropzone>
    </div>
  );
}

/* ================================= wizard ================================= */

export function IdVerificationWizard() {
  const [step, setStep] = useState(0);
  const [idFront, setIdFront] = useState<Shot | null>(null);
  const [idBack, setIdBack] = useState<Shot | null>(null);
  const [selfie, setSelfie] = useState<Shot | null>(null);
  const [info, setInfo] = useState<Info>({ fullName: "", dob: "", idNumber: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof Info, string>>>({});
  const [fileError, setFileError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const selfieInput = useRef<HTMLInputElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  // The stream lives in a ref so unmount cleanup never has to touch state.
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const releaseCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  function stopCamera() {
    releaseCamera();
    setCameraOn(false);
  }

  // Never leave the camera running if the user navigates away mid-capture.
  useEffect(() => releaseCamera, []);

  /** Every step change goes through here, so the camera can't outlive step 2. */
  function goTo(i: number) {
    stopCamera();
    setFileError(null);
    setStep(i);
  }

  async function openCamera() {
    setCameraError(null);
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      streamRef.current = s;
      setCameraOn(true);
      if (video.current) {
        video.current.srcObject = s;
        await video.current.play();
      }
    } catch {
      setCameraError(
        "The camera isn't available — allow access in your browser, or upload a photo instead.",
      );
    }
  }

  function capture() {
    const v = video.current;
    if (!v || !v.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = v.videoWidth;
    canvas.height = v.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // Mirror, so the capture matches the preview the user was looking at.
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(v, 0, 0);
    setSelfie({ url: canvas.toDataURL("image/jpeg", 0.92), name: "selfie.jpg" });
    stopCamera();
  }

  async function take(file: File | undefined, set: (s: Shot) => void) {
    setFileError(null);
    if (!file) return;
    const { shot, error } = await readImage(file);
    if (error) setFileError(error);
    else if (shot) set(shot);
  }

  function validateInfo() {
    const next: Partial<Record<keyof Info, string>> = {};
    if (!info.fullName.trim()) next.fullName = "Enter your name exactly as it appears on the document.";
    if (!info.dob) next.dob = "Enter your date of birth.";
    else if (new Date(info.dob) > new Date()) next.dob = "That date is in the future.";
    if (!info.idNumber.trim()) next.idNumber = "Enter the document number.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  const canAdvance = step === 0 ? !!idFront && !!idBack : step === 1 ? !!selfie : true;

  function next() {
    if (step === 2 && !validateInfo()) return;
    goTo(step + 1);
  }

  /* ------------------------------ submitted ----------------------------- */

  if (submitted) {
    return (
      <div className="text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-amber-100 text-amber-600">
          <ShieldCheck className="h-9 w-9" />
        </span>
        <h1 className="mt-6 text-2xl font-bold tracking-tight text-navy-800 sm:text-3xl">
          Verification pending
        </h1>
        <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-slate-500">
          We&apos;ll check your document and selfie and let you know the result. Most checks finish
          within a few minutes.
        </p>

        <div className="mx-auto mt-7 max-w-md text-left">
          <PendingNotice>
            Nothing was submitted — the verification API does not exist yet, so your document and
            selfie never left this page.
          </PendingNotice>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/profile/edit"
            className="rounded-lg border border-slate-200 px-6 py-3 text-sm font-semibold text-navy-800 transition hover:bg-slate-50"
          >
            Back to my profile
          </Link>
          <button
            type="button"
            onClick={() => {
              setSubmitted(false);
              goTo(0);
              setIdFront(null);
              setIdBack(null);
              setSelfie(null);
            }}
            className="rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            Start again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Stepper step={step} onJump={goTo} />

      {/* ------------------------------ 1 · ID ------------------------------ */}
      {step === 0 ? (
        <>
          <StepHeader title="Upload your ID card">
            Upload a clear photo of both sides of your government-issued ID card.
            <br />
            Supported formats: JPG, PNG. Max size: 5MB per image.
          </StepHeader>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <DocSide
              label="Front"
              shot={idFront}
              error={fileError}
              onFile={(f) => take(f, setIdFront)}
              onClear={() => setIdFront(null)}
            />
            <DocSide
              label="Back"
              shot={idBack}
              error={fileError}
              onFile={(f) => take(f, setIdBack)}
              onClear={() => setIdBack(null)}
            />
          </div>

          <p className="mt-5 text-sm leading-relaxed text-slate-500">
            Both sides are needed — the back usually carries the card number and expiry date we
            check against the details you enter next.
          </p>
        </>
      ) : null}

      {/* ---------------------------- 2 · selfie ---------------------------- */}
      {step === 1 ? (
        <>
          <StepHeader title="Take a selfie">
            We compare your selfie to the photo on your document, so look straight at the camera in
            good light and remove hats or sunglasses.
          </StepHeader>

          <Dropzone error={fileError} onFile={(f) => take(f, setSelfie)}>
            {selfie ? (
              <Preview shot={selfie} label="Your selfie" onClear={() => setSelfie(null)} />
            ) : cameraOn ? (
              <>
                <div className="relative mx-auto h-56 w-56 overflow-hidden rounded-full ring-4 ring-brand-100">
                  <video ref={video} playsInline muted className="h-full w-full -scale-x-100 object-cover" />
                </div>
                <div className="mt-5 flex flex-wrap justify-center gap-3">
                  <button
                    type="button"
                    onClick={capture}
                    className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
                  >
                    Capture
                  </button>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="rounded-lg border border-slate-200 px-6 py-2.5 text-sm font-semibold text-navy-800 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-brand-50 text-brand-600">
                  <IdUpload className="h-7 w-7" />
                </span>
                <p className="mt-4 font-semibold text-navy-800">Take a selfie with your camera</p>
                <p className="mt-1 text-sm text-slate-400">or drop a photo here</p>
                <div className="mt-3 flex flex-wrap justify-center gap-3">
                  <button
                    type="button"
                    onClick={openCamera}
                    className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
                  >
                    Open camera
                  </button>
                  <button
                    type="button"
                    onClick={() => selfieInput.current?.click()}
                    className="rounded-lg border border-slate-200 px-6 py-2.5 text-sm font-semibold text-navy-800 transition hover:bg-slate-50"
                  >
                    Upload instead
                  </button>
                </div>
              </>
            )}
            <input
              ref={selfieInput}
              type="file"
              aria-label="Upload a selfie"
              accept={IMAGE_TYPES.join(",")}
              capture="user"
              className="sr-only"
              onChange={(e) => take(e.target.files?.[0], setSelfie)}
            />
          </Dropzone>

          {cameraError ? (
            <p role="alert" className="mt-3 text-sm text-amber-700">
              {cameraError}
            </p>
          ) : null}
        </>
      ) : null}

      {/* ----------------------------- 3 · info ----------------------------- */}
      {step === 2 ? (
        <>
          <StepHeader title="Enter your information">
            This must match your document exactly — we compare what you type against the text we read
            from it.
          </StepHeader>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <Field label="Full name" error={errors.fullName} className="sm:col-span-2">
              <TextInput
                value={info.fullName}
                onChange={(e) => setInfo({ ...info, fullName: e.target.value })}
                invalid={!!errors.fullName}
                placeholder="As printed on your document"
                autoComplete="name"
              />
            </Field>

            <Field label="Date of birth" error={errors.dob}>
              <TextInput
                type="date"
                value={info.dob}
                onChange={(e) => setInfo({ ...info, dob: e.target.value })}
                invalid={!!errors.dob}
              />
            </Field>

            <Field label="ID card number" error={errors.idNumber}>
              <TextInput
                value={info.idNumber}
                onChange={(e) => setInfo({ ...info, idNumber: e.target.value })}
                invalid={!!errors.idNumber}
                placeholder="The number printed on your document"
              />
            </Field>
          </div>
        </>
      ) : null}

      {/* ---------------------------- 4 · review ---------------------------- */}
      {step === 3 ? (
        <>
          <StepHeader title="Check your details">
            Make sure everything is right before you submit. You can go back and change anything.
          </StepHeader>

          <div className="mt-6 space-y-4">
            <div className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-navy-800">ID card</p>
                  <p className="text-sm text-slate-500">Front and back</p>
                </div>
                <button type="button" onClick={() => goTo(0)} className="text-sm font-medium text-brand-600 hover:text-brand-700">
                  Edit
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-3">
                {[
                  { shot: idFront, label: "Front" },
                  { shot: idBack, label: "Back" },
                ].map(({ shot, label }) =>
                  shot ? (
                    <figure key={label}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={shot.url}
                        alt={`ID card, ${label.toLowerCase()}`}
                        className="h-16 w-24 rounded-md object-cover ring-1 ring-slate-200"
                      />
                      <figcaption className="mt-1 text-xs text-slate-400">{label}</figcaption>
                    </figure>
                  ) : null,
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-xl border border-slate-200 p-4">
              {selfie ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={selfie.url} alt="" className="h-16 w-16 shrink-0 rounded-full object-cover ring-1 ring-slate-200" />
              ) : null}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-navy-800">Selfie</p>
                <p className="truncate text-sm text-slate-500">{selfie?.name}</p>
              </div>
              <button type="button" onClick={() => goTo(1)} className="text-sm font-medium text-brand-600 hover:text-brand-700">
                Edit
              </button>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-4">
                <p className="text-sm font-semibold text-navy-800">Your information</p>
                <button type="button" onClick={() => goTo(2)} className="text-sm font-medium text-brand-600 hover:text-brand-700">
                  Edit
                </button>
              </div>
              <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                {[
                  ["Full name", info.fullName],
                  ["Date of birth", info.dob],
                  ["Document number", info.idNumber],
                ].map(([k, v]) => (
                  <div key={k} className="flex gap-2">
                    <dt className="text-slate-400">{k}:</dt>
                    <dd className="min-w-0 truncate text-navy-800">{v || "—"}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          <div className="mt-6 flex gap-3 rounded-lg bg-brand-50 p-4">
            <ShieldCheck className="h-5 w-5 shrink-0 text-brand-600" />
            <p className="text-sm leading-relaxed text-brand-800">
              Your document and selfie are stored encrypted, outside the public web root, and are
              never shown on your profile.
            </p>
          </div>
        </>
      ) : null}

      {fileError ? (
        <p role="alert" className="mt-3 text-sm text-red-600">
          {fileError}
        </p>
      ) : null}

      {/* ------------------------------- nav -------------------------------- */}
      <div className="mt-8 flex items-center justify-between gap-4">
        {step > 0 ? (
          <button
            type="button"
            onClick={() => goTo(step - 1)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-navy-800 transition hover:text-brand-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        ) : (
          <span />
        )}

        {step < STEPS.length - 1 ? (
          <button
            type="button"
            disabled={!canAdvance}
            onClick={next}
            className="rounded-lg bg-brand-600 px-9 py-3 text-base font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setSubmitted(true)}
            className="rounded-lg bg-brand-600 px-9 py-3 text-base font-semibold text-white transition hover:bg-brand-700"
          >
            Submit for verification
          </button>
        )}
      </div>
    </div>
  );
}
