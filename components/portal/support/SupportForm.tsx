"use client";

import React, { useState } from "react";

export function SupportForm() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [ticketSuccess, setTicketSuccess] = useState<{
    ticketId: string;
    message: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      setErrorMessage("Please enter both a subject and message for your support ticket.");
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      let uploadedFileUrl: string | undefined = undefined;
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (uploadRes.ok) {
          const uploadJson = await uploadRes.json();
          uploadedFileUrl = uploadJson.url || uploadJson.storageUrl;
        }
      }

      const res = await fetch("/api/customer/support-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          message,
          fileUrl: uploadedFileUrl,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to submit support ticket.");
      }

      setTicketSuccess({
        ticketId: json.ticketId,
        message: json.message || "Support ticket created successfully.",
      });

      setSubject("");
      setMessage("");
      setFile(null);
    } catch (err: any) {
      console.error("Support form error:", err);
      setErrorMessage(err.message || "Failed to submit support ticket.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-none p-6 md:p-8 text-[var(--color-text-primary)] shadow-none space-y-6 transition-colors">
      <div className="border-b border-[var(--color-border)] pb-4">
        <h2 className="text-base font-bold uppercase tracking-wider font-mono flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-[var(--color-accent)] rounded-none" />
          Submit a Support Ticket
        </h2>
        <p className="text-xs text-[var(--color-text-secondary)] mt-1">
          Engineering Inquiries, Pattern Grading &amp; Order Assistance
        </p>
      </div>

      {ticketSuccess ? (
        <div className="p-6 bg-[var(--color-bg)] border border-[var(--color-status-success)] rounded-none space-y-3 font-mono text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--color-status-success-bg)] text-[var(--color-status-success)] border border-[var(--color-status-success)]/40 text-xs font-bold uppercase">
            ✓ Ticket Created #{ticketSuccess.ticketId}
          </span>
          <p className="text-xs text-[var(--color-text-primary)] leading-relaxed max-w-md mx-auto">
            {ticketSuccess.message}
          </p>
          <button
            type="button"
            onClick={() => setTicketSuccess(null)}
            className="mt-2 text-xs font-bold text-[var(--color-accent)] hover:underline uppercase cursor-pointer"
          >
            Submit Another Ticket →
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs">
          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1.5">
              Subject / Topic *
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Order #ORD-901 Fabric Lot Verification"
              className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] p-3 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-accent)] focus:outline-none rounded-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1.5">
              Message Details *
            </label>
            <textarea
              rows={5}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your inquiry, specification details, or order question..."
              className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] p-3 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-accent)] focus:outline-none rounded-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1.5">
              File Attachment <span className="text-[var(--color-text-secondary)] font-normal lowercase">(optional: PDF, CAD, PNG, Tech Pack)</span>
            </label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] p-2 text-xs text-[var(--color-text-secondary)] focus:outline-none rounded-none cursor-pointer"
            />
          </div>

          {errorMessage && (
            <div className="p-3 bg-[var(--color-status-error-bg)] border border-[var(--color-status-error)] text-xs text-[var(--color-status-error)] font-medium">
              {errorMessage}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="h-12 px-6 bg-[var(--color-accent)] hover:bg-[#1E3F7A] disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider rounded-none transition-colors inline-flex items-center gap-2 cursor-pointer"
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting Ticket...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base">send</span>
                  <span>Submit Ticket</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setSubject("");
                setMessage("");
                setFile(null);
              }}
              className="h-12 px-6 bg-[var(--color-bg)] border border-[var(--color-border)] hover:border-[var(--color-accent)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] text-xs font-semibold uppercase tracking-wider rounded-none transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
