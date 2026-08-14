"use client";

import { useRef, useState } from "react";
import { PendingNotice } from "@/components/auth-fields";
import { Check, IdUpload } from "@/components/icons";

const STEPS = ["Upload ID", "Take Selfie", "Your Info", "Review"];
const ACCEPT = "image/jpeg,image/png";
const MAX_BYTES = 5 * 1024 * 1024;

export function IdUploadForm() {
  const input = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function accept(chosen: File | undefined) {
    setSubmitted(false);
    if (!chosen) return;
    if (!ACCEPT.split(",").includes(chosen.type)) {
      setFile(null);
      setError("That file type isn't supported. Upload a JPG or PNG.");
      return;
    }
    if (chosen.size > MAX_BYTES) {
      setFile(null);
      setError("That file is over the 5MB limit.");
      return;
    }
    setError(null);
    setFile(chosen);
  }

  return (
    <div>
      {/* ------------------------------- stepper ------------------------------ */}
      <ol className="flex items-center border-b border-slate-200 pb-6">
        {STEPS.map((label, i) => (
          <li key={label} className={`flex items-center ${i < STEPS.length - 1 ? "flex-1" : ""}`}>
            <div className="flex flex-col items-center gap-2">
              <span
                aria-current={i === 0 ? "step" : undefined}
                className={`grid h-8 w-8 place-items-center rounded-full text-sm font-semibold ${
                  i === 0 ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-400"
                }`}
              >
                {i + 1}
              </span>
              <span className={`text-xs ${i === 0 ? "font-semibold text-brand-600" : "text-slate-400"}`}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 ? <span className="mx-2 h-px flex-1 bg-slate-200" /> : null}
          </li>
        ))}
      </ol>

      <h1 className="mt-7 text-2xl font-bold tracking-tight text-navy-800 sm:text-3xl">
        Upload your ID card
      </h1>
      <p className="mt-3 text-base leading-relaxed text-slate-500">
        Upload a clear photo of your government-issued ID.
        <br />
        Supported formats: JPG, PNG. Max size: 5MB.
      </p>

      {/* ------------------------------ dropzone ------------------------------ */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          accept(e.dataTransfer.files[0]);
        }}
        className={`mt-6 rounded-xl border-2 border-dashed px-6 py-12 text-center transition ${
          dragging ? "border-brand-500 bg-brand-50" : error ? "border-red-300 bg-red-50/40" : "border-brand-200 bg-white"
        }`}
      >
        {file ? (
          <>
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-emerald-500 text-white">
              <Check className="h-6 w-6" />
            </span>
            <p className="mt-4 font-semibold text-navy-800">{file.name}</p>
            <p className="mt-1 text-sm text-slate-500">{(file.size / 1024).toFixed(0)} KB — ready to upload</p>
            <button
              type="button"
              onClick={() => {
                setFile(null);
                if (input.current) input.current.value = "";
              }}
              className="mt-5 rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-navy-800 transition hover:bg-slate-50"
            >
              Choose a different file
            </button>
          </>
        ) : (
          <>
            <IdUpload className="mx-auto h-12 w-12 text-brand-600" />
            <p className="mt-4 font-semibold text-navy-800">Drag &amp; drop your ID card here</p>
            <p className="mt-1 text-sm text-slate-400">or</p>
            <button
              type="button"
              onClick={() => input.current?.click()}
              className="mt-3 rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              Choose File
            </button>
          </>
        )}

        <input
          ref={input}
          type="file"
          accept={ACCEPT}
          className="sr-only"
          onChange={(e) => accept(e.target.files?.[0])}
        />
      </div>

      {error ? (
        <p role="alert" className="mt-3 text-sm text-red-600">
          {error}
        </p>
      ) : null}

      <p className="mt-5 text-sm text-slate-500">
        Accepted documents:
        <br />
        Driver&apos;s License, Passport, National ID Card
      </p>

      {submitted ? (
        <div className="mt-5">
          <PendingNotice>
            Nothing has been uploaded — your ID never leaves this page until the verification API
            exists. It will then be stored encrypted, outside the public web root.
          </PendingNotice>
        </div>
      ) : null}

      <div className="mt-8 flex justify-end">
        <button
          type="button"
          disabled={!file}
          onClick={() => setSubmitted(true)}
          className="rounded-lg bg-brand-600 px-9 py-3 text-base font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
        >
          Next
        </button>
      </div>
    </div>
  );
}
