"use client";

import { useState } from "react";
import { useAdminLanguage } from "@/components/admin/AdminLanguageContext";

export interface PriceOfferV2 {
  id: string; // e.g. "po-1"
  orderId: string; // e.g. "#WH001"
  productName: string;
  quantity: number;
  offeredPriceUSD: number;
  listPriceUSD: number;
  supplierId: string;
  supplierName: string;
  supplierContact: string;
  supplierEmail: string;
  supplierPhone: string;
  supplierNote: string;
  adminNote: string;
  status: "PENDING_SUPPLIER" | "PENDING_ADMIN" | "ACCEPTED" | "REJECTED" | "COUNTER_OFFERED";
  counterPriceUSD?: number | null;
  acceptedPriceUSD?: number | null;
}

export interface PriceOfferInboxTabProps {
  offers: PriceOfferV2[];
  onAcceptOffer: (id: string) => void;
  onRejectOffer: (id: string) => void;
  onCounterOffer: (id: string, counterPriceUSD: number, adminMessage: string) => void;
  onSaveAdminNote?: (id: string, note: string) => void;
  showToast: (msg: string, type?: "success" | "error") => void;
}

export function PriceOfferInboxTab({
  offers,
  onAcceptOffer,
  onRejectOffer,
  onCounterOffer,
  onSaveAdminNote,
  showToast,
}: PriceOfferInboxTabProps) {
  const { t } = useAdminLanguage();
  const [rejectingOffer, setRejectingOffer] = useState<PriceOfferV2 | null>(null);
  const [counteringOffer, setCounteringOffer] = useState<PriceOfferV2 | null>(null);
  const [counterPriceInput, setCounterPriceInput] = useState<string>("");
  const [counterMessageInput, setCounterMessageInput] = useState<string>("");
  const [editingAdminNoteId, setEditingAdminNoteId] = useState<string | null>(null);
  const [tempAdminNote, setTempAdminNote] = useState<string>("");

  const handleAccept = (offer: PriceOfferV2) => {
    onAcceptOffer(offer.id);
    showToast(`Price offer ${offer.orderId} accepted ($${offer.offeredPriceUSD}/unit)`, "success");
  };

  const handleConfirmReject = () => {
    if (rejectingOffer) {
      onRejectOffer(rejectingOffer.id);
      showToast(`Price offer ${rejectingOffer.orderId} rejected`, "success");
      setRejectingOffer(null);
    }
  };

  const handleSendCounterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!counteringOffer) return;

    const val = parseFloat(counterPriceInput);
    if (isNaN(val) || val <= 0 || val > counteringOffer.listPriceUSD) {
      showToast(`Counter price must be > $0 and ≤ list price ($${counteringOffer.listPriceUSD})`, "error");
      return;
    }

    onCounterOffer(counteringOffer.id, val, counterMessageInput);
    showToast(`Counter offer of $${val.toFixed(2)}/unit sent to ${counteringOffer.supplierName}`, "success");
    setCounteringOffer(null);
    setCounterPriceInput("");
    setCounterMessageInput("");
  };

  return (
    <section className="bg-[var(--color-surface)] text-[var(--color-text-primary)] border border-[var(--color-border)] rounded-none p-6 space-y-6 select-none font-sans transition-colors">
      <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
            {t.priceOfferInboxTitle}
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
            {t.priceOfferInboxSub}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {offers.map((offer) => {
          const isPendingAdmin = offer.status === "PENDING_ADMIN";
          const isPendingSupplier = offer.status === "PENDING_SUPPLIER";
          const isAccepted = offer.status === "ACCEPTED";
          const isRejected = offer.status === "REJECTED";
          const isCountered = offer.status === "COUNTER_OFFERED";

          return (
            <div
              key={offer.id}
              className="border border-[var(--color-border)] bg-[var(--color-bg)] rounded-none p-5 space-y-4 transition-all"
            >
              {/* Header Row */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[var(--color-border)] pb-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-mono font-bold text-sm text-[var(--color-accent)]">
                    {offer.orderId}
                  </span>
                  <span className="font-bold text-[var(--color-text-primary)] text-sm">
                    {offer.productName} ({offer.quantity} units)
                  </span>
                  <span className="font-mono text-xs font-bold text-emerald-500">
                    ${offer.offeredPriceUSD.toFixed(0)}/unit
                  </span>
                  <span className="text-[11px] text-[var(--color-text-secondary)] font-mono">
                    (vs ${offer.listPriceUSD.toFixed(0)} list)
                  </span>
                </div>

                {/* Status Badge */}
                <div className="font-mono text-xs font-bold uppercase">
                  {isPendingAdmin && (
                    <span className="bg-amber-500/10 text-amber-500 px-2.5 py-1 rounded-none border border-amber-500/30 inline-flex items-center gap-1">
                      ⏳ PENDING ADMIN REVIEW
                    </span>
                  )}
                  {isPendingSupplier && (
                    <span className="bg-sky-500/10 text-sky-500 px-2.5 py-1 rounded-none border border-sky-500/30 inline-flex items-center gap-1">
                      ⏳ PENDING SUPPLIER RESPONSE
                    </span>
                  )}
                  {isAccepted && (
                    <span className="bg-emerald-500/10 text-emerald-500 px-2.5 py-1 rounded-none border border-emerald-500/30 inline-flex items-center gap-1">
                      ✓ ACCEPTED (${offer.acceptedPriceUSD || offer.offeredPriceUSD}/unit)
                    </span>
                  )}
                  {isRejected && (
                    <span className="bg-red-500/10 text-red-500 px-2.5 py-1 rounded-none border border-red-500/30 inline-flex items-center gap-1">
                      ✗ REJECTED
                    </span>
                  )}
                  {isCountered && (
                    <span className="bg-sky-500/10 text-sky-500 px-2.5 py-1 rounded-none border border-sky-500/30 inline-flex items-center gap-1">
                      ⏳ COUNTER OFFERED (${offer.counterPriceUSD}/unit)
                    </span>
                  )}
                </div>
              </div>

              {/* ADMIN ONLY Supplier Info Box */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-3 rounded-none space-y-1">
                  <div className="font-bold text-amber-500 uppercase text-[10px] tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">lock</span>
                    SUPPLIER INFO (ADMIN ONLY — Hidden from customer)
                  </div>
                  <div className="font-bold text-[var(--color-text-primary)]">{offer.supplierName}</div>
                  <div className="text-[var(--color-text-secondary)]">
                    Contact: {offer.supplierContact} • {offer.supplierEmail}
                  </div>
                  <div className="text-[var(--color-text-secondary)]">Phone: {offer.supplierPhone}</div>
                </div>

                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-3 rounded-none space-y-1">
                  <div className="font-bold text-[var(--color-text-secondary)] uppercase text-[10px] tracking-wider">
                    SUPPLIER&apos;S NOTE
                  </div>
                  <p className="text-[var(--color-text-primary)] italic">
                    &quot;{offer.supplierNote || "No note provided."}&quot;
                  </p>
                </div>
              </div>

              {/* Admin Internal Notes Section */}
              <div className="text-xs space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[var(--color-text-primary)] uppercase tracking-wider text-[11px]">
                    Internal Admin Notes:
                  </span>
                  {editingAdminNoteId !== offer.id && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingAdminNoteId(offer.id);
                        setTempAdminNote(offer.adminNote || "");
                      }}
                      className="text-[11px] font-bold text-[var(--color-accent)] hover:underline cursor-pointer"
                    >
                      Edit Note
                    </button>
                  )}
                </div>

                {editingAdminNoteId === offer.id ? (
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={tempAdminNote}
                      onChange={(e) => setTempAdminNote(e.target.value)}
                      placeholder="Add internal note..."
                      className="flex-1 px-3 py-1.5 bg-[var(--color-surface)] border border-[var(--color-accent)] rounded-none text-xs text-[var(--color-text-primary)]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        onSaveAdminNote?.(offer.id, tempAdminNote);
                        setEditingAdminNoteId(null);
                        showToast("Saved internal admin note", "success");
                      }}
                      className="px-3 py-1.5 bg-[var(--color-accent)] text-white text-xs font-bold uppercase rounded-none cursor-pointer"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <p className="text-[var(--color-text-secondary)] font-mono text-xs italic bg-[var(--color-surface)] p-2 border border-[var(--color-border)] rounded-none">
                    {offer.adminNote || "No internal admin note."}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-2 border-t border-[var(--color-border)]">
                {isPendingAdmin || isPendingSupplier ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleAccept(offer)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider rounded-none transition-colors cursor-pointer"
                    >
                      {t.approveOffer}
                    </button>
                    <button
                      type="button"
                      onClick={() => setRejectingOffer(offer)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider rounded-none transition-colors cursor-pointer"
                    >
                      {t.rejectOffer}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCounteringOffer(offer);
                        setCounterPriceInput(offer.offeredPriceUSD.toString());
                        setCounterMessageInput("");
                      }}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold uppercase tracking-wider rounded-none transition-colors cursor-pointer"
                    >
                      {t.counterOfferBtn}
                    </button>
                  </>
                ) : (
                  <span className="text-xs text-[var(--color-text-secondary)] font-mono italic">
                    Action completed ({offer.status})
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Counter Modal */}
      {counteringOffer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans select-none">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-none w-full max-w-[480px] text-[var(--color-text-primary)] shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
                COUNTER OFFER TO SUPPLIER: {counteringOffer.supplierName}
              </h3>
              <button
                type="button"
                onClick={() => setCounteringOffer(null)}
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] text-base font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendCounterSubmit} className="space-y-4 text-xs">
              <div className="bg-[var(--color-bg)] p-3 rounded-none border border-[var(--color-border)] space-y-1 font-mono">
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-secondary)]">Buyer Offer:</span>
                  <span className="font-bold text-emerald-500">
                    ${counteringOffer.offeredPriceUSD}/unit ({counteringOffer.quantity} units)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-secondary)]">Supplier List Price:</span>
                  <span className="font-bold text-[var(--color-text-primary)]">${counteringOffer.listPriceUSD}/unit</span>
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-[var(--color-text-primary)] mb-1.5">
                  Your Counter Price (USD, per unit) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-[var(--color-text-secondary)] font-mono font-bold">$</span>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    max={counteringOffer.listPriceUSD}
                    required
                    value={counterPriceInput}
                    onChange={(e) => setCounterPriceInput(e.target.value)}
                    placeholder="110"
                    className="w-full pl-8 pr-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-primary)] font-mono font-bold rounded-none focus:border-[var(--color-accent)] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-[var(--color-text-primary)] mb-1.5">
                  Message to Supplier (Optional)
                </label>
                <textarea
                  rows={3}
                  value={counterMessageInput}
                  onChange={(e) => setCounterMessageInput(e.target.value)}
                  placeholder="e.g. We can commit to 50 units if you accept $110/unit..."
                  className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-none focus:border-[var(--color-accent)] focus:outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[var(--color-border)]">
                <button
                  type="button"
                  onClick={() => setCounteringOffer(null)}
                  className="px-4 py-2 bg-[var(--color-bg)] text-[var(--color-text-primary)] border border-[var(--color-border)] rounded-none font-bold uppercase text-xs hover:bg-[var(--color-surface)] cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-none font-bold uppercase tracking-wider text-xs transition-colors cursor-pointer"
                >
                  {t.sendCounterBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectingOffer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans select-none">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-none w-full max-w-[440px] text-[var(--color-text-primary)] shadow-2xl p-6 space-y-5">
            <div className="flex items-center gap-3 text-red-500">
              <span className="material-symbols-outlined text-2xl">error</span>
              <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
                Reject Price Offer
              </h3>
            </div>

            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              Reject price offer of <strong>${rejectingOffer.offeredPriceUSD}/unit</strong> for{" "}
              <strong>{rejectingOffer.quantity} {rejectingOffer.productName}s</strong> ({rejectingOffer.orderId})?
            </p>

            <div className="flex justify-end gap-3 pt-3 border-t border-[var(--color-border)]">
              <button
                type="button"
                onClick={() => setRejectingOffer(null)}
                className="px-4 py-2 bg-[var(--color-bg)] text-[var(--color-text-primary)] border border-[var(--color-border)] rounded-none font-bold uppercase tracking-wider text-xs hover:bg-[var(--color-surface)] cursor-pointer"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-none font-bold uppercase tracking-wider text-xs transition-colors cursor-pointer"
              >
                REJECT
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
