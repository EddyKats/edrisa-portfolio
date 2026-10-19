"use client";

import { useState, type FormEvent } from "react";
import { getNavItem } from "@/data/navigation";
import { contactCopy, contactDetails, projectTypes } from "@/data/contact";

type Field = "name" | "email" | "projectType" | "message";
type Errors = Partial<Record<Field, string>>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const contactSurface = getNavItem("contact").surfaceClass;

export function ContactForm({ heading, inbox }: { heading: string; inbox?: string }) {
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

    const subject = `${projectType} · ${name}`;
    const body = `${message}\n\n${name}\n${email}`;
    window.location.href = `mailto:${inbox || contactDetails.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setStatus(contactCopy.sendNote);
  }

  return (
    <form className="contact-form" noValidate onSubmit={onSubmit}>
      <h2 className="about-chapter-title">{heading}</h2>
      <div className="mt-8 space-y-6">
        <Field id="contact-name" name="name" label="Name" autoComplete="name" error={errors.name} />
        <Field
          id="contact-email"
          name="email"
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email}
        />
        <div>
          <label className="contact-label" htmlFor="contact-project-type">
            Project
          </label>
          <select
            id="contact-project-type"
            name="projectType"
            defaultValue=""
            required
            aria-invalid={Boolean(errors.projectType)}
            aria-describedby={errors.projectType ? "contact-project-type-error" : undefined}
            className="contact-field"
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
            <p id="contact-project-type-error" className="contact-error">
              {errors.projectType}
            </p>
          ) : null}
        </div>
        <div>
          <label className="contact-label" htmlFor="contact-message">
            Message
          </label>
          <textarea
            id="contact-message"
            name="message"
            required
            rows={6}
            aria-invalid={Boolean(errors.message)}
            aria-describedby={errors.message ? "contact-message-error" : undefined}
            className="contact-field contact-field-area"
          />
          {errors.message ? (
            <p id="contact-message-error" className="contact-error">
              {errors.message}
            </p>
          ) : null}
        </div>
      </div>
      <div className="contact-send">
        <button type="submit" className={`contact-send-btn ${contactSurface}`}>
          {contactCopy.sendLabel}
          <span aria-hidden="true">→</span>
        </button>
      </div>
      <p id="contact-form-note" className="mt-4 max-w-sm text-sm leading-relaxed text-ink/60">
        {contactCopy.sendNote}
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
      <label className="contact-label" htmlFor={id}>
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
        className="contact-field"
      />
      {error ? (
        <p id={errorId} className="contact-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
