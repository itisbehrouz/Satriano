"use client";

import { useState } from "react";

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
    <section className="bg-white border border-[#EAECF0] rounded-md p-6 space-y-6 select-none font-sans">
      <div className="flex items-center justify-between border-b border-[#EAECF0] pb-4">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#111318]">
            PRICE OFFER INBOX (Multi-Supplier Negotiation)
          </h2>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Admin multi-supplier price offer desk. Supplier details & notes are visible to Admin only.
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

          let borderClass = "border-[#EAECF0]";
          let bgClass = "bg-white";
          if (isPendingAdmin) {
            borderClass = "border-[#F0B94A]";
            bgClass = "bg-[#FDF6E7]/40";
          }
          if (isPendingSupplier) {
            borderClass = "border-[#85B7EB]";
            bgClass = "bg-[#E6F1FB]/40";
          }
          if (isAccepted) {
            borderClass = "border-[#5DCAA5]";
            bgClass = "bg-[#ECFDF3]/40";
          }
          if (isRejected) {
            borderClass = "border-[#F8B4B4]";
            bgClass = "bg-[#FEE4E2]/40";
          }

          return (
            <div
              key={offer.id}
              className={`border ${borderClass} ${bgClass} rounded-md p-5 space-y-4 transition-all shadow-xs`}
            >
              {/* Header Row */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#EAECF0] pb-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-sm text-[#2E5AAC]">
                    {offer.orderId}
                  </span>
                  <span className="font-bold text-[#111318] text-sm">
                    {offer.productName} ({offer.quantity} units)
                  </span>
                  <span className="font-mono text-xs font-bold text-[#067647]">
                    ${offer.offeredPriceUSD.toFixed(0)}/unit
                  </span>
                  <span className="text-[11px] text-[#6B7280] font-mono">
                    (vs ${offer.listPriceUSD.toFixed(0)} list)
                  </span>
                </div>

                {/* Status Badge */}
                <div className="font-mono text-xs font-bold uppercase">
                  {isPendingAdmin && (
                    <span className="bg-[#FDF6E7] text-[#854F0B] px-2.5 py-1 rounded-none border border-[#F0B94A]/40 inline-flex items-center gap-1">
                      ⏳ PENDING ADMIN REVIEW
                    </span>
                  )}
                  {isPendingSupplier && (
                    <span className="bg-[#E6F1FB] text-[#185FA5] px-2.5 py-1 rounded-none border border-[#2E5AAC]/40 inline-flex items-center gap-1">
                      ⏳ PENDING SUPPLIER RESPONSE
                    </span>
                  )}
                  {isAccepted && (
                    <span className="bg-[#ECFDF3] text-[#067647] px-2.5 py-1 rounded-none border border-[#5DCAA5]/40 inline-flex items-center gap-1">
                      ✓ ACCEPTED (${offer.acceptedPriceUSD || offer.offeredPriceUSD}/unit)
                    </span>
                  )}
                  {isRejected && (
                    <span className="bg-[#FEE4E2] text-[#C5221F] px-2.5 py-1 rounded-none border border-[#F8B4B4] inline-flex items-center gap-1">
                      ✗ REJECTED
                    </span>
                  )}
                  {isCountered && (
                    <span className="bg-[#E6F1FB] text-[#185FA5] px-2.5 py-1 rounded-none border border-[#2E5AAC]/40 inline-flex items-center gap-1">
                      ⏳ COUNTER OFFERED (${offer.counterPriceUSD}/unit)
                    </span>
                  )}
                </div>
              </div>

              {/* ADMIN ONLY Supplier Info Box */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div className="bg-white border border-[#E2E8F0] p-3 rounded-md space-y-1">
                  <div className="font-bold text-[#854F0B] uppercase text-[10px] tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">lock</span>
                    SUPPLIER INFO (ADMIN ONLY — Hidden from customer)
                  </div>
                  <div className="font-bold text-[#0F172A]">{offer.supplierName}</div>
                  <div className="text-[#475569]">
                    Contact: {offer.supplierContact} • {offer.supplierEmail}
                  </div>
                  <div className="text-[#475569]">Phone: {offer.supplierPhone}</div>
                </div>

                <div className="bg-white border border-[#E2E8F0] p-3 rounded-md space-y-1">
                  <div className="font-bold text-[#64748B] uppercase text-[10px] tracking-wider">
                    SUPPLIER&apos;S NOTE
                  </div>
                  <p className="text-[#334155] italic">
                    &quot;{offer.supplierNote || "No note provided."}&quot;
                  </p>
                </div>
              </div>

              {/* Admin Internal Notes Section */}
              <div className="text-xs space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#344054] uppercase tracking-wider text-[11px]">
                    Internal Admin Notes:
                  </span>
                  {editingAdminNoteId !== offer.id && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingAdminNoteId(offer.id);
                        setTempAdminNote(offer.adminNote || "");
                      }}
                      className="text-[11px] font-bold text-[#2E5AAC] hover:underline cursor-pointer"
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
                      className="flex-1 px-3 py-1.5 bg-white border border-[#2E5AAC] rounded-md text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        onSaveAdminNote?.(offer.id, tempAdminNote);
                        setEditingAdminNoteId(null);
                        showToast("Saved internal admin note", "success");
                      }}
                      className="px-3 py-1.5 bg-[#2E5AAC] text-white text-xs font-bold uppercase rounded-md"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <p className="text-[#64748B] font-mono text-xs italic bg-[#F8FAFC] p-2 border border-[#E2E8F0] rounded-md">
                    {offer.adminNote || "No internal admin note."}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-2 border-t border-[#EAECF0]">
                {isPendingAdmin || isPendingSupplier ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleAccept(offer)}
                      className="px-4 py-2 bg-[#067647] hover:bg-emerald-800 text-white text-xs font-bold uppercase tracking-wider rounded-md transition-colors cursor-pointer shadow-xs"
                    >
                      ACCEPT
                    </button>
                    <button
                      type="button"
                      onClick={() => setRejectingOffer(offer)}
                      className="px-4 py-2 bg-[#C5221F] hover:bg-red-800 text-white text-xs font-bold uppercase tracking-wider rounded-md transition-colors cursor-pointer shadow-xs"
                    >
                      REJECT
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCounteringOffer(offer);
                        setCounterPriceInput(offer.offeredPriceUSD.toString());
                        setCounterMessageInput("");
                      }}
                      className="px-4 py-2 bg-[#854F0B] hover:bg-amber-800 text-white text-xs font-bold uppercase tracking-wider rounded-md transition-colors cursor-pointer shadow-xs"
                    >
                      COUNTER OFFER
                    </button>
                  </>
                ) : (
                  <span className="text-xs text-[#6B7280] font-mono italic">
                    Action completed ({offer.status})
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Counter Modal (PROMPT 4) */}
      {counteringOffer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans select-none">
          <div className="bg-white border border-[#EAECF0] rounded-md w-full max-w-[480px] text-[#111318] shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#EAECF0] pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#111318]">
                COUNTER OFFER TO SUPPLIER: {counteringOffer.supplierName}
              </h3>
              <button
                type="button"
                onClick={() => setCounteringOffer(null)}
                className="text-[#6B7280] hover:text-[#111318] text-base font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendCounterSubmit} className="space-y-4 text-xs">
              <div className="bg-[#F8FAFC] p-3 rounded-md border border-[#E2E8F0] space-y-1 font-mono">
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Buyer Offer:</span>
                  <span className="font-bold text-[#067647]">
                    ${counteringOffer.offeredPriceUSD}/unit ({counteringOffer.quantity} units)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Supplier List Price:</span>
                  <span className="font-bold text-[#0F172A]">${counteringOffer.listPriceUSD}/unit</span>
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-[#344054] mb-1.5">
                  Your Counter Price (USD, per unit) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-[#64748B] font-mono font-bold">$</span>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    max={counteringOffer.listPriceUSD}
                    required
                    value={counterPriceInput}
                    onChange={(e) => setCounterPriceInput(e.target.value)}
                    placeholder="110"
                    className="w-full pl-8 pr-3 py-2 bg-white border border-[#D0D5DD] text-[#111318] font-mono font-bold rounded-md focus:border-[#2E5AAC] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-[#344054] mb-1.5">
                  Message to Supplier (Optional)
                </label>
                <textarea
                  rows={3}
                  value={counterMessageInput}
                  onChange={(e) => setCounterMessageInput(e.target.value)}
                  placeholder="e.g. We can commit to 50 units if you accept $110/unit..."
                  className="w-full px-3 py-2 bg-white border border-[#D0D5DD] text-[#111318] rounded-md focus:border-[#2E5AAC] focus:outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#EAECF0]">
                <button
                  type="button"
                  onClick={() => setCounteringOffer(null)}
                  className="px-4 py-2 bg-white text-[#344054] border border-[#D0D5DD] rounded-md font-bold uppercase text-xs hover:bg-[#F9FAFB] cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#854F0B] hover:bg-amber-800 text-white rounded-md font-bold uppercase tracking-wider text-xs transition-colors cursor-pointer shadow-xs"
                >
                  SEND COUNTER
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectingOffer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans select-none">
          <div className="bg-white border border-[#EAECF0] rounded-md w-full max-w-[440px] text-[#111318] shadow-2xl p-6 space-y-5">
            <div className="flex items-center gap-3 text-[#C5221F]">
              <span className="material-symbols-outlined text-2xl">error</span>
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#111318]">
                Reject Price Offer
              </h3>
            </div>

            <p className="text-xs text-[#6B7280] leading-relaxed">
              Reject price offer of <strong>${rejectingOffer.offeredPriceUSD}/unit</strong> for{" "}
              <strong>{rejectingOffer.quantity} {rejectingOffer.productName}s</strong> ({rejectingOffer.orderId})?
            </p>

            <div className="flex justify-end gap-3 pt-3 border-t border-[#EAECF0]">
              <button
                type="button"
                onClick={() => setRejectingOffer(null)}
                className="px-4 py-2 bg-white text-[#344054] border border-[#D0D5DD] rounded-md font-bold uppercase tracking-wider text-xs hover:bg-[#F9FAFB] cursor-pointer"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-4 py-2 bg-[#C5221F] hover:bg-red-800 text-white rounded-md font-bold uppercase tracking-wider text-xs transition-colors cursor-pointer"
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
