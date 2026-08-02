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
    <div className="bg-[#132A52] border border-[#2E5AAC] rounded-none p-6 md:p-8 text-[#E8ECF3] shadow-none space-y-6">
      <div className="border-b border-[#2E5AAC]/40 pb-4">
        <h2 className="text-base font-bold uppercase tracking-wider font-mono flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-[#2E5AAC] rounded-none" />
          Submit a Support Ticket
        </h2>
        <p className="text-xs text-[#8DA0C4] mt-1">
          Engineering Inquiries, Pattern Grading &amp; Order Assistance
        </p>
      </div>

      {ticketSuccess ? (
        <div className="p-6 bg-[#0B1E3D] border border-[#5DCAA5] rounded-none space-y-3 font-mono text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#14301F] text-[#5DCAA5] border border-[#5DCAA5]/40 text-xs font-bold uppercase">
            ✓ Ticket Created #{ticketSuccess.ticketId}
          </span>
          <p className="text-xs text-[#E8ECF3] leading-relaxed max-w-md mx-auto">
            {ticketSuccess.message}
          </p>
          <button
            type="button"
            onClick={() => setTicketSuccess(null)}
            className="mt-2 text-xs font-bold text-[#85B7EB] hover:underline uppercase cursor-pointer"
          >
            Submit Another Ticket →
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs">
          <div>
            <label className="block text-xs font-semibold text-[#8DA0C4] uppercase tracking-wider mb-1.5">
              Subject / Topic *
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Order #ORD-901 Fabric Lot Verification"
              className="w-full bg-[#0B1E3D] border border-[#2E5AAC] p-3 text-sm text-[#E8ECF3] focus:border-[#85B7EB] focus:outline-none rounded-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8DA0C4] uppercase tracking-wider mb-1.5">
              Message Details *
            </label>
            <textarea
              rows={5}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your inquiry, specification details, or order question..."
              className="w-full bg-[#0B1E3D] border border-[#2E5AAC] p-3 text-sm text-[#E8ECF3] focus:border-[#85B7EB] focus:outline-none rounded-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8DA0C4] uppercase tracking-wider mb-1.5">
              File Attachment <span className="text-[#8DA0C4] font-normal lowercase">(optional: PDF, CAD, PNG, Tech Pack)</span>
            </label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full bg-[#0B1E3D] border border-[#2E5AAC] p-2 text-xs text-[#8DA0C4] focus:outline-none rounded-none cursor-pointer"
            />
          </div>

          {errorMessage && (
            <div className="p-3 bg-[#3A1414] border border-[#C5221F] text-xs text-[#F8B4B4] font-medium">
              {errorMessage}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="h-12 px-6 bg-[#2E5AAC] hover:bg-[#1E3F7A] disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider rounded-none transition-colors inline-flex items-center gap-2 cursor-pointer"
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
              className="h-12 px-6 bg-[#0B1E3D] border border-[#8DA0C4] hover:border-white text-[#8DA0C4] hover:text-white text-xs font-semibold uppercase tracking-wider rounded-none transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
