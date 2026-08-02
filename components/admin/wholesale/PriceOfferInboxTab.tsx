"use client";

import { useState } from "react";

export interface PriceOffer {
  id: string; // e.g. "po-1"
  orderId: string; // e.g. "#WH001"
  productName: string;
  quantity: number;
  offeredPriceUSD: number;
  listPriceUSD: number;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "COUNTER_PENDING";
  counterPriceUSD?: number | null;
}

export interface PriceOfferInboxTabProps {
  offers: PriceOffer[];
  onAcceptOffer: (id: string) => void;
  onRejectOffer: (id: string) => void;
  onCounterOffer: (id: string, counterPriceUSD: number) => void;
  showToast: (msg: string, type?: "success" | "error") => void;
}

export function PriceOfferInboxTab({
  offers,
  onAcceptOffer,
  onRejectOffer,
  onCounterOffer,
  showToast,
}: PriceOfferInboxTabProps) {
  const [rejectingOffer, setRejectingOffer] = useState<PriceOffer | null>(null);
  const [counteringOfferId, setCounteringOfferId] = useState<string | null>(null);
  const [counterInputMap, setCounterInputMap] = useState<Record<string, string>>({});
  const [inputErrorMap, setInputErrorMap] = useState<Record<string, string>>({});

  const handleAccept = (offer: PriceOffer) => {
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

  const handleSendCounter = (offer: PriceOffer) => {
    const rawVal = counterInputMap[offer.id] || "";
    const parsed = parseFloat(rawVal);

    if (isNaN(parsed) || parsed <= 0 || parsed > offer.listPriceUSD) {
      setInputErrorMap((prev) => ({
        ...prev,
        [offer.id]: `Must be > $0 and ≤ list price ($${offer.listPriceUSD})`,
      }));
      return;
    }

    setInputErrorMap((prev) => ({ ...prev, [offer.id]: "" }));
    onCounterOffer(offer.id, parsed);
    showToast(`Counter offer sent for ${offer.orderId}: $${parsed.toFixed(2)}/unit`, "success");
    setCounteringOfferId(null);
  };

  return (
    <section className="bg-white border border-[#EAECF0] rounded-md p-6 space-y-6 select-none font-sans">
      <div className="flex items-center justify-between border-b border-[#EAECF0] pb-4">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#111318]">
            PRICE OFFER INBOX
          </h2>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Review bulk order price suggestions from B2B buyers
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#F7F8FA] border-b border-[#EAECF0] text-[#111318] font-bold uppercase tracking-wider h-11">
              <th className="py-3 px-4">Order</th>
              <th className="py-3 px-4">Product</th>
              <th className="py-3 px-4 text-center">Qty</th>
              <th className="py-3 px-4">Offered Price</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EAECF0]">
            {offers.map((offer) => {
              const isPending = offer.status === "PENDING";
              const isAccepted = offer.status === "ACCEPTED";
              const isRejected = offer.status === "REJECTED";
              const isCounterPending = offer.status === "COUNTER_PENDING";

              let rowBg = "bg-white";
              if (isPending) rowBg = "bg-[#FDF6E7]";
              if (isAccepted) rowBg = "bg-[#ECFDF3]";
              if (isRejected) rowBg = "bg-[#FEE4E2]";
              if (isCounterPending) rowBg = "bg-[#E6F1FB]";

              const isCounterInputVisible = counteringOfferId === offer.id;

              return (
                <tr key={offer.id} className={`h-16 transition-colors ${rowBg}`}>
                  {/* Order ID */}
                  <td className="py-3 px-4 font-mono font-bold text-[#2E5AAC]">
                    {offer.orderId}
                  </td>

                  {/* Product */}
                  <td className="py-3 px-4 font-bold text-[#111318]">
                    {offer.productName}
                  </td>

                  {/* Qty */}
                  <td className="py-3 px-4 text-center font-mono font-bold text-[#111318]">
                    {offer.quantity}
                  </td>

                  {/* Offered Price */}
                  <td className="py-3 px-4 font-mono">
                    <div className="font-bold text-[#067647]">
                      ${offer.offeredPriceUSD.toFixed(0)}/unit
                    </div>
                    <div className="text-[11px] text-[#6B7280]">
                      (vs ${offer.listPriceUSD.toFixed(0)} list)
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 px-4 font-bold uppercase text-xs">
                    {isPending && (
                      <span className="bg-[#FAEEDA] text-[#854F0B] px-2.5 py-1 rounded-none border border-[#F0B94A]/40 inline-flex items-center gap-1">
                        ⏳ PENDING
                      </span>
                    )}
                    {isAccepted && (
                      <span className="bg-[#E1F5EE] text-[#067647] px-2.5 py-1 rounded-none border border-[#5DCAA5]/40 inline-flex items-center gap-1">
                        ✓ ACCEPTED
                      </span>
                    )}
                    {isRejected && (
                      <span className="bg-[#FCEBEB] text-[#C5221F] px-2.5 py-1 rounded-none border border-[#F8B4B4] inline-flex items-center gap-1">
                        ✗ REJECTED
                      </span>
                    )}
                    {isCounterPending && (
                      <span className="bg-[#E6F1FB] text-[#185FA5] px-2.5 py-1 rounded-none border border-[#2E5AAC]/40 inline-flex items-center gap-1">
                        ⏳ COUNTER (${offer.counterPriceUSD}/unit)
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    {isPending ? (
                      <div className="flex flex-col items-end gap-1.5">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleAccept(offer)}
                            className="px-3 py-1.5 bg-[#067647] hover:bg-emerald-800 text-white text-xs font-bold uppercase rounded-md transition-colors cursor-pointer shadow-xs"
                          >
                            ACCEPT
                          </button>
                          <button
                            type="button"
                            onClick={() => setRejectingOffer(offer)}
                            className="px-3 py-1.5 bg-[#C5221F] hover:bg-red-800 text-white text-xs font-bold uppercase rounded-md transition-colors cursor-pointer shadow-xs"
                          >
                            REJECT
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setCounteringOfferId(
                                isCounterInputVisible ? null : offer.id
                              );
                              setInputErrorMap((prev) => ({ ...prev, [offer.id]: "" }));
                            }}
                            className="px-3 py-1.5 bg-[#854F0B] hover:bg-amber-800 text-white text-xs font-bold uppercase rounded-md transition-colors cursor-pointer shadow-xs"
                          >
                            COUNTER
                          </button>
                        </div>

                        {/* Inline Counter Input */}
                        {isCounterInputVisible && (
                          <div className="flex items-center gap-1.5 pt-1">
                            <span className="text-[11px] font-bold text-[#854F0B]">Counter:</span>
                            <div className="relative">
                              <span className="absolute left-2 top-1 text-[11px] font-mono text-[#64748B]">$</span>
                              <input
                                type="number"
                                step="1"
                                placeholder="Counter $"
                                value={counterInputMap[offer.id] || ""}
                                onChange={(e) =>
                                  setCounterInputMap({
                                    ...counterInputMap,
                                    [offer.id]: e.target.value,
                                  })
                                }
                                className="w-24 pl-5 pr-2 py-1 bg-white border border-[#D0D5DD] text-xs font-mono font-bold rounded-md focus:border-[#2E5AAC] focus:outline-none"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleSendCounter(offer)}
                              className="px-3 py-1 bg-[#2E5AAC] hover:bg-[#1E3A8A] text-white text-xs font-bold uppercase rounded-md transition-colors cursor-pointer"
                            >
                              SEND
                            </button>
                          </div>
                        )}
                        {inputErrorMap[offer.id] && (
                          <span className="text-[10px] text-[#C5221F]">
                            {inputErrorMap[offer.id]}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-[#6B7280] italic">
                        Action completed
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Reject Confirmation Modal */}
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
