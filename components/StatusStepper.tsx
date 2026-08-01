"use client";

import React from "react";

export type OrderLifecycleStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "PROFORMA_SENT"
  | "APPROVED"
  | "PAID"
  | "IN_PRODUCTION"
  | "SHIPPED"
  | "CANCELLED";

interface StatusStepperProps {
  status: OrderLifecycleStatus;
}

const STAGES: Array<{ id: OrderLifecycleStatus; label: string; step: number }> = [
  { id: "PENDING_REVIEW", label: "Feasibility Review", step: 1 },
  { id: "PROFORMA_SENT", label: "Proforma Sent", step: 2 },
  { id: "APPROVED", label: "Spec Approved", step: 3 },
  { id: "PAID", label: "Payment Confirmed", step: 4 },
  { id: "IN_PRODUCTION", label: "In Production", step: 5 },
  { id: "SHIPPED", label: "Order Shipped", step: 6 },
];

export function StatusStepper({ status }: StatusStepperProps) {
  if (status === "CANCELLED") {
    return (
      <div className="p-3 bg-[#FEF3F2] border border-[#FECDCA] rounded-md text-xs text-[#B42318] flex items-center justify-between font-sans">
        <div className="flex items-center gap-2 font-semibold">
          <span className="material-symbols-outlined text-base">cancel</span>
          <span>Order Cancelled</span>
        </div>
        <span className="text-[11px] font-mono">Status: CANCELLED</span>
      </div>
    );
  }

  // Determine current active step index (1-based)
  const currentStep =
    status === "DRAFT"
      ? 1
      : STAGES.find((s) => s.id === status)?.step ?? 1;

  return (
    <div className="w-full font-sans space-y-2 py-2">
      {/* Visual Stepper Track */}
      <div className="relative flex items-center justify-between">
        {/* Background Connecting Line */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-[#EAECF0] z-0" />

        {/* Progress Completed Line */}
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-[#2E5AAC] z-0 transition-all duration-500"
          style={{
            width: `${((currentStep - 1) / (STAGES.length - 1)) * 100}%`,
          }}
        />

        {/* Step Nodes */}
        {STAGES.map((stage) => {
          const isCompleted = stage.step < currentStep;
          const isCurrent = stage.step === currentStep;

          return (
            <div key={stage.id} className="relative z-10 flex flex-col items-center group">
              {/* Circle Badge */}
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors ${
                  isCompleted
                    ? "bg-[#2E5AAC] text-white border-[#2E5AAC]"
                    : isCurrent
                    ? "bg-white text-[#2E5AAC] border-[#2E5AAC] ring-4 ring-[#F0F5FF]"
                    : "bg-white text-[#667085] border-[#D0D5DD]"
                }`}
              >
                {isCompleted ? (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : isCurrent ? (
                  <span className="w-2 h-2 rounded-full bg-[#2E5AAC] animate-pulse" />
                ) : (
                  <span>{stage.step}</span>
                )}
              </div>

              {/* Label below node */}
              <span
                className={`text-[10px] font-semibold mt-1.5 whitespace-nowrap hidden sm:block ${
                  isCompleted || isCurrent ? "text-[#101828]" : "text-[#667085]"
                }`}
              >
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
