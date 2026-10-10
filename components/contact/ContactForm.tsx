"use client";

import { useState, type FormEvent } from "react";
import { contactCopy, projectTypes } from "@/data/contact";

type Field = "name" | "email" | "projectType" | "message";
type Errors = Partial<Record<Field, string>>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const fieldClass =
  "mt-2 w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-base text-ink outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";

export function ContactForm({ heading }: { heading: string }) {
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<string | null>(null);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const projectType = String(data.get("projectType") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();
    const nextErrors: Errors = {};

    if (name.length < 2) nextErrors.name = "Add your name.";
    if (!emailPattern.test(email)) nextErrors.email = "That email doesn't look usable.";
    if (!projectTypes.includes(projectType as (typeof projectTypes)[number])) {
      nextErrors.projectType = "Pick a project type.";
    }
    if (message.length < 10) nextErrors.message = "A little more detail helps.";

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setStatus(null);
      return;
    }

    setStatus(contactCopy.pendingStatus);
  }

  return (
    <form className="rounded-2xl bg-white px-6 py-8 shadow-[0_12px_40px_rgb(28_18_14/0.05)] sm:px-8" noValidate onSubmit={onSubmit}>
      <h2 className="text-xl font-semibold tracking-tight">{heading}</h2>
      <div className="mt-8 space-y-6">
        <Field
          id="contact-name"
          name="name"
          label="Name"
          autoComplete="name"
          error={errors.name}
        />
        <Field
          id="contact-email"
          name="email"
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email}
        />
        <div>
          <label className="text-sm font-semibold" htmlFor="contact-project-type">
            Project Type
          </label>
          <select
            id="contact-project-type"
            name="projectType"
            defaultValue=""
            required
            aria-invalid={Boolean(errors.projectType)}
            aria-describedby={errors.projectType ? "contact-project-type-error" : undefined}
            className={fieldClass}
          >
            <option value="" disabled>
              Choose one
            </option>
            {projectTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {errors.projectType ? (
            <p id="contact-project-type-error" className="mt-2 text-sm text-[#8a2e16]">
              {errors.projectType}
            </p>
          ) : null}
        </div>
        <div>
          <label className="text-sm font-semibold" htmlFor="contact-message">
            Message
          </label>
          <textarea
            id="contact-message"
            name="message"
            required
            rows={6}
            aria-invalid={Boolean(errors.message)}
            aria-describedby={errors.message ? "contact-message-error" : undefined}
            className={`${fieldClass} min-h-40 resize-y`}
          />
          {errors.message ? (
            <p id="contact-message-error" className="mt-2 text-sm text-[#8a2e16]">
              {errors.message}
            </p>
          ) : null}
        </div>
      </div>
      <button type="submit" className="mt-8 inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,#FFE14A_0%,#FF8E12_55%,#F25C0A_100%)] px-6 py-3 text-sm font-semibold text-[#2a160c] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2a160c]">
        {contactCopy.sendLabel}
      </button>
      <p id="contact-form-note" className="mt-4 max-w-sm text-sm leading-relaxed text-ink/60">
        {contactCopy.pendingNote}
      </p>
      {status ? (
        <p role="status" className="mt-3 max-w-sm text-sm leading-relaxed text-ink">
          {status}
        </p>
      ) : null}
    </form>
  );
}

function Field({
  id,
  name,
  label,
  type = "text",
  autoComplete,
  error,
}: {
  id: string;
  name: Field;
  label: string;
  type?: string;
  autoComplete: string;
  error?: string;
}) {
  const errorId = `${id}-error`;

  return (
    <div>
      <label className="text-sm font-semibold" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        required
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={fieldClass}
      />
      {error ? (
        <p id={errorId} className="mt-2 text-sm text-[#8a2e16]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
