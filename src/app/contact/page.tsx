"use client";

import * as React from "react";
import { getBrandConfig } from "@/lib/brand-config";
import { PAGE_CONTENT_CLASS } from "@/lib/page-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { Clock, ExternalLink, Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react";

const fieldClass =
  "h-11 rounded-xl border border-white/10 bg-white/6 py-3 text-primary shadow-inner shadow-black/10 placeholder:text-zinc-500 transition-all duration-300 hover:border-white/15 hover:bg-white/8 focus-visible:border-primary-1/45 focus-visible:bg-white/9 focus-visible:ring-2 focus-visible:ring-primary-1/25 focus-visible:ring-offset-0 focus-visible:outline-none md:text-sm";

const textareaClass =
  "min-h-[128px] rounded-xl border border-white/10 bg-white/6 py-3 text-primary shadow-inner shadow-black/10 placeholder:text-zinc-500 transition-all duration-300 hover:border-white/15 hover:bg-white/8 focus-visible:border-primary-1/45 focus-visible:bg-white/9 focus-visible:ring-2 focus-visible:ring-primary-1/25 focus-visible:ring-offset-0 focus-visible:outline-none md:text-sm";

function InfoCard({
  icon: Icon,
  title,
  children,
  className,
}: {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "rounded-2xl border border-zinc-800 bg-[#1a1a1a] p-5 sm:p-6",
        "shadow-sm transition-all duration-200 hover:border-zinc-700/90 hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.65)]",
        className,
      )}
    >
      <div className="mb-3 flex items-center gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-1/12 ring-1 ring-primary-1/25 shadow-[0_0_24px_-4px_rgba(250,204,21,0.2)]"
          aria-hidden
        >
          <Icon className="size-4.5 text-primary-1" strokeWidth={2} />
        </div>
        <h3 className="text-sm font-semibold tracking-tight text-primary">{title}</h3>
      </div>
      <div className="space-y-2 text-sm leading-relaxed text-zinc-400">{children}</div>
    </article>
  );
}

export default function ContactPage() {
  const config = getBrandConfig();
  const contact = config.content.contact;
  const supportEmail = contact.email?.trim() || "";
  const phone = contact.phone?.trim();

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [formError, setFormError] = React.useState<string | null>(null);
  const [submitted, setSubmitted] = React.useState(false);

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.location)}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!name.trim() || !email.trim() || !message.trim()) {
      setFormError("Please fill in every field.");
      return;
    }
    if (!supportEmail) {
      setFormError("Contact email is not configured for this brand.");
      return;
    }
    const subject = encodeURIComponent(`Message from ${name.trim()}`);
    const body = encodeURIComponent(
      `Name: ${name.trim()}\nEmail: ${email.trim()}\n\n${message.trim()}`,
    );
    window.location.href = `mailto:${supportEmail}?subject=${subject}&body=${body}`;
    setSubmitted(true);
  };

  return (
    <div className="min-w-0 pt-24 sm:pt-32 pb-16 sm:pb-20 text-primary">
      <div className={cn(PAGE_CONTENT_CLASS, "space-y-8")}>
        <header className="relative overflow-hidden rounded-2xl border border-zinc-800/90 bg-linear-to-br from-[#1c1c1c] via-[#161616] to-[#141414] px-5 py-6 sm:px-7 sm:py-8 shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset]">
          <div
            className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-linear-to-b from-primary-1 via-primary-1/70 to-primary-1/25"
            aria-hidden
          />
          <div className="relative space-y-4 pl-4 sm:pl-5">
            <div className="flex flex-wrap items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-1/12 ring-1 ring-primary-1/25 shadow-[0_0_24px_-4px_rgba(250,204,21,0.25)]"
                aria-hidden
              >
                <MessageCircle className="size-4.5 text-primary-1" strokeWidth={2} />
              </div>
              <div className="flex min-w-0 flex-col gap-0.5">
                <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.22em] text-primary-1/95">
                  Contact
                </p>
                <p className="text-xs font-medium tracking-wide text-zinc-500">{config.name}</p>
              </div>
            </div>
            <div className="space-y-2.5">
              <h1 className="text-3xl sm:text-[2.125rem] font-bold text-primary tracking-tight leading-[1.15]">
                {contact.title}
              </h1>
              <p className="text-zinc-400 text-sm sm:text-[15px] leading-relaxed max-w-2xl">
                {contact.subtitle}
              </p>
            </div>
          </div>
        </header>

        <div className="grid gap-6 sm:gap-8 lg:grid-cols-12 lg:gap-10">
          <div className="flex flex-col gap-4 sm:gap-5 lg:col-span-5">
            <InfoCard icon={MapPin} title="Location">
              <p className="text-zinc-300">{contact.location}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 h-9 w-full rounded-xl border-zinc-700/90 text-zinc-300 hover:bg-zinc-800/80 hover:text-white sm:w-auto"
                asChild
              >
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="size-3.5" />
                  Open in Maps
                </a>
              </Button>
            </InfoCard>

            <InfoCard icon={Clock} title="Hours">
              <p>
                <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">Mon–Fri</span>{" "}
                <span className="text-zinc-300">{contact.hours.week}</span>
              </p>
              <p>
                <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">Weekend</span>{" "}
                <span className="text-zinc-300">{contact.hours.weekend}</span>
              </p>
            </InfoCard>

            {supportEmail ? (
              <InfoCard icon={Mail} title="Email">
                <a
                  href={`mailto:${supportEmail}`}
                  className="inline-flex font-medium text-primary-1 transition-colors hover:text-primary-1-hover break-all"
                >
                  {supportEmail}
                </a>
              </InfoCard>
            ) : null}

            {phone ? (
              <InfoCard icon={Phone} title="Phone">
                <a
                  href={`tel:${phone.replace(/[^\d+]/g, "")}`}
                  className="inline-flex font-medium text-primary-1 transition-colors hover:text-primary-1-hover"
                >
                  {phone}
                </a>
              </InfoCard>
            ) : null}
          </div>

          <div className="lg:col-span-7">
            <div
              className={cn(
                "rounded-2xl border border-zinc-800/90 bg-[#1a1a1a] p-5 sm:p-7 lg:p-8",
                "shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset]",
                "transition-all duration-200 hover:border-zinc-700/90",
              )}
            >
              <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.22em] text-primary-1/95">
                Write to us
              </p>
              <h2 className="mt-2 text-xl font-bold tracking-tight text-primary sm:text-2xl">Send a message</h2>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                We will open your email app with your message ready to send to our team.
              </p>

              {submitted ? (
                <p className="mt-6 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200/90">
                  If your mail app did not open, copy your message and email{" "}
                  {supportEmail ? (
                    <a href={`mailto:${supportEmail}`} className="font-medium text-primary-1 underline underline-offset-2">
                      {supportEmail}
                    </a>
                  ) : (
                    "us"
                  )}
                  .
                </p>
              ) : null}

              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                <div className="space-y-2">
                  <label htmlFor="contact-name" className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                    Name
                  </label>
                  <Input
                    id="contact-name"
                    name="name"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className={fieldClass}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="contact-email" className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                    Email
                  </label>
                  <Input
                    id="contact-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={fieldClass}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="contact-message" className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                    Message
                  </label>
                  <Textarea
                    id="contact-message"
                    name="message"
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="How can we help?"
                    className={textareaClass}
                  />
                </div>

                {formError ? (
                  <p
                    className="rounded-xl border border-red-500/25 bg-red-500/10 px-3 py-2 text-sm text-red-300"
                    role="alert"
                  >
                    {formError}
                  </p>
                ) : null}

                <Button type="submit" variant="primary" className="h-11 w-full rounded-xl px-8 font-semibold sm:w-auto">
                  <Send className="size-4" />
                  Send via email
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
