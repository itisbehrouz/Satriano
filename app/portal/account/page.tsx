"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { TabNavigation, type AccountTab } from "@/components/portal/account/TabNavigation";
import { CompanyInfoTab } from "@/components/portal/account/CompanyInfoTab";
import { SettingsTab } from "@/components/portal/account/SettingsTab";
import { BillingTab } from "@/components/portal/account/BillingTab";

function AccountPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabParam = (searchParams.get("tab") || "company") as AccountTab;
  const activeTab: AccountTab = ["company", "settings", "billing"].includes(tabParam)
    ? tabParam
    : "company";

  const [session, setSession] = useState<{
    companyName: string;
    email: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSession() {
      try {
        const res = await fetch("/api/customer/session");
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            setSession({
              companyName: data.companyName || "Corporate Account",
              email: data.email,
            });
          }
        }
      } catch (err) {
        console.error("Account session error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSession();
  }, []);

  function handleTabChange(newTab: AccountTab) {
    router.push(`/portal/account?tab=${newTab}`, { scroll: false });
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0B1E3D] py-10 px-4 sm:px-6 lg:px-8 font-sans select-none rounded-none">
        <div className="max-w-[1440px] mx-auto">
          <div className="bg-[#132A52] border border-[#2E5AAC] rounded-none p-12 text-center text-xs text-[#8DA0C4]">
            <span className="inline-block w-6 h-6 border-2 border-[#2E5AAC] border-t-transparent rounded-full animate-spin mb-2" />
            <p>Loading Account Settings &amp; Preferences...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0B1E3D] text-[#E8ECF3] py-6 sm:py-10 px-4 sm:px-6 lg:px-8 font-sans select-none rounded-none">
      <div className="max-w-[1440px] mx-auto space-y-6">
        {/* Title Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-[#85B7EB] uppercase tracking-wider">
            <span>Client Portal</span>
            <span>•</span>
            <span>Account Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            {session?.companyName || "Account Settings"}
          </h1>
        </div>

        {/* Tab Navigation */}
        <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} />

        {/* Tab Content Panel */}
        <div className="pt-2">
          {activeTab === "company" && (
            <CompanyInfoTab
              companyName={session?.companyName || "Satriano B2B Partner"}
              email={session?.email || "account@satriano.com"}
            />
          )}

          {activeTab === "settings" && <SettingsTab />}

          {activeTab === "billing" && <BillingTab />}
        </div>
      </div>
    </main>
  );
}

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#0B1E3D] flex items-center justify-center font-sans text-xs text-[#8DA0C4]">
          <span className="inline-block w-5 h-5 border-2 border-[#2E5AAC] border-t-transparent rounded-full animate-spin mb-2" />
        </main>
      }
    >
      <AccountPageContent />
    </Suspense>
  );
}
