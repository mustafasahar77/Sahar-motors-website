"use client";

import { useEffect, useRef, useState } from "react";
import { isFormsConfigured, site } from "@/lib/site";
import { CheckCircle, ArrowRight } from "@/components/icons";

type Status = "idle" | "submitting" | "success" | "error" | "demo";

type ContactFormProps = {
  /** Email subject line forwarded to the dealership. */
  subject: string;
  /** Hidden key/value pairs included with the submission (e.g. vehicle id). */
  hiddenFields?: Record<string, string>;
  /** Extra visible fields rendered above the message box (must have `name`). */
  topFields?: React.ReactNode;
  submitLabel?: string;
  messageLabel?: string;
  messagePlaceholder?: string;
  defaultMessage?: string;
  /** Require a phone number in addition to email. */
  requirePhone?: boolean;
};

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-navy-500";

const ENDPOINT = "https://api.web3forms.com/submit";

export default function ContactForm({
  subject,
  hiddenFields,
  topFields,
  submitLabel = "Send Message",
  messageLabel = "Message",
  messagePlaceholder = "How can we help?",
  defaultMessage = "",
  requirePhone = false,
}: ContactFormProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string>("");
  const successRef = useRef<HTMLHeadingElement>(null);

  // Move focus to the confirmation when the form is replaced, so keyboard and
  // screen-reader users are told the submission succeeded.
  useEffect(() => {
    if (status === "success") successRef.current?.focus();
  }, [status]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;

    // Honeypot — bots fill hidden fields; humans don't.
    const honeypot = (form.elements.namedItem("botcheck") as HTMLInputElement)
      ?.checked;
    if (honeypot) return;

    if (!isFormsConfigured) {
      setStatus("demo");
      return;
    }

    setStatus("submitting");
    setError("");

    try {
      const payload = new FormData(form);
      payload.append("access_key", site.web3formsAccessKey);
      payload.append("subject", subject);
      payload.append("from_name", site.name);

      const res = await fetch(ENDPOINT, { method: "POST", body: payload });
      const data = await res.json();

      if (res.ok && data.success) {
        setStatus("success");
        form.reset();
      } else {
        setStatus("error");
        setError(data.message || "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setError(
        "We couldn't send your message. Please check your connection or call us directly.",
      );
    }
  }

  if (status === "success") {
    return (
      <div
        role="status"
        className="rounded-xl border border-green-200 bg-green-50 p-6 text-center"
      >
        <CheckCircle size={40} className="mx-auto text-green-600" />
        <h3
          ref={successRef}
          tabIndex={-1}
          className="mt-3 text-lg font-bold text-navy-900 outline-none"
        >
          Message sent!
        </h3>
        <p className="mt-1 text-sm text-slate-600">
          Thanks for reaching out. A member of our team will get back to you
          shortly. For anything urgent, call us at {site.phones[0].value}.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-4 text-sm font-semibold text-brand-600 hover:underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {!isFormsConfigured && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs text-amber-800">
          <strong>Demo mode:</strong> this form isn&apos;t connected to email
          yet. Add a free Web3Forms key in <code>lib/site.ts</code> to start
          receiving submissions (see HANDOFF.md).
        </p>
      )}

      {hiddenFields &&
        Object.entries(hiddenFields).map(([key, value]) => (
          <input key={key} type="hidden" name={key} value={value} readOnly />
        ))}

      {/* Honeypot — hidden from assistive tech so it isn't read aloud */}
      <label className="sr-only" aria-hidden="true">
        Leave this field empty
        <input
          type="checkbox"
          name="botcheck"
          tabIndex={-1}
          autoComplete="off"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="cf-name"
            className="mb-1 block text-sm font-medium text-navy-900"
          >
            Full name <span className="text-brand-500">*</span>
          </label>
          <input
            id="cf-name"
            name="name"
            type="text"
            required
            autoComplete="name"
            placeholder="Jane Doe"
            className={inputClass}
          />
        </div>
        <div>
          <label
            htmlFor="cf-phone"
            className="mb-1 block text-sm font-medium text-navy-900"
          >
            Phone {requirePhone && <span className="text-brand-500">*</span>}
          </label>
          <input
            id="cf-phone"
            name="phone"
            type="tel"
            required={requirePhone}
            autoComplete="tel"
            placeholder="(604) 555-0123"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="cf-email"
          className="mb-1 block text-sm font-medium text-navy-900"
        >
          Email <span className="text-brand-500">*</span>
        </label>
        <input
          id="cf-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className={inputClass}
        />
      </div>

      {topFields}

      <div>
        <label
          htmlFor="cf-message"
          className="mb-1 block text-sm font-medium text-navy-900"
        >
          {messageLabel} <span className="text-brand-500">*</span>
        </label>
        <textarea
          id="cf-message"
          name="message"
          required
          rows={5}
          defaultValue={defaultMessage}
          placeholder={messagePlaceholder}
          className={`${inputClass} resize-y`}
        />
      </div>

      {status === "demo" && (
        <p
          role="status"
          className="rounded-lg border border-navy-200 bg-navy-50 px-3.5 py-2.5 text-sm text-navy-800"
        >
          Form captured successfully in demo mode. Connect a Web3Forms key to
          deliver this to {site.email}.
        </p>
      )}
      {status === "error" && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      {/* Persistent live region announces the in-progress state */}
      <span role="status" className="sr-only">
        {status === "submitting" ? "Sending your message…" : ""}
      </span>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
      >
        {status === "submitting" ? "Sending…" : submitLabel}
        {status !== "submitting" && <ArrowRight size={18} />}
      </button>

      <p className="text-xs text-slate-500">
        By submitting, you agree to be contacted by {site.name} about your
        inquiry. We never share your information.
      </p>
    </form>
  );
}
