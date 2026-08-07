"use client";

import dynamic from "next/dynamic";

const CookieConsentModal = dynamic(
  () => import("@/components/layout/CookieConsentModal").then((mod) => mod.CookieConsentModal),
  { ssr: false }
);

const B2BSupportDock = dynamic(
  () => import("@/components/layout/B2BSupportDock").then((mod) => mod.B2BSupportDock),
  { ssr: false }
);

const AIFaqAssistantModal = dynamic(
  () => import("@/components/layout/AIFaqAssistantModal").then((mod) => mod.AIFaqAssistantModal),
  { ssr: false }
);

export function ClientLayoutModals() {
  return (
    <>
      <CookieConsentModal />
      <B2BSupportDock />
      <AIFaqAssistantModal />
    </>
  );
}
