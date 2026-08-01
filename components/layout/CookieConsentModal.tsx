"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type TabType = "consent" | "details" | "about";

interface CookieCategoryState {
  necessary: boolean;
  preferences: boolean;
  statistics: boolean;
  marketing: boolean;
}

export function CookieConsentModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("consent");
  const [categories, setCategories] = useState<CookieCategoryState>({
    necessary: true,
    preferences: true,
    statistics: false,
    marketing: false,
  });

  useEffect(() => {
    // Check if consent has already been saved
    const savedConsent = localStorage.getItem("sat_cookie_consent");
    if (!savedConsent) {
      setIsOpen(true);
    }

    // Listen for custom trigger event (e.g. from Footer link)
    const handleOpenModal = () => setIsOpen(true);
    window.addEventListener("open-cookie-preferences", handleOpenModal);
    return () => window.removeEventListener("open-cookie-preferences", handleOpenModal);
  }, []);

  const handleSaveConsent = (consentState: CookieCategoryState) => {
    localStorage.setItem("sat_cookie_consent", JSON.stringify(consentState));
    setCategories(consentState);
    setIsOpen(false);
  };

  const handleAllowAll = () => {
    handleSaveConsent({
      necessary: true,
      preferences: true,
      statistics: true,
      marketing: true,
    });
  };

  const handleDeny = () => {
    handleSaveConsent({
      necessary: true,
      preferences: false,
      statistics: false,
      marketing: false,
    });
  };

  const handleAllowSelection = () => {
    handleSaveConsent(categories);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 font-sans">
      <div className="w-full max-w-3xl bg-white border border-[#CBD5E1] rounded-none shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Brand Header */}
        <div className="px-6 py-4 bg-[#0B1E3D] text-white flex items-center justify-between border-b border-[#1E3A8A]">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-none bg-[#60A5FA] animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest text-white">Satriano Atelier • Cookie &amp; Privacy Compliance</span>
          </div>
          <span className="text-[11px] font-mono text-[#93C5FD] bg-[#2E5AAC]/30 border border-[#2E5AAC]/50 px-2 py-0.5 rounded-none">
            GDPR Art. 6
          </span>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#E2E8F0] bg-[#F8FAFC]">
          <button
            onClick={() => setActiveTab("consent")}
            className={`flex-1 py-3 px-4 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition-all ${
              activeTab === "consent"
                ? "border-[#2E5AAC] text-[#0369A1] bg-white"
                : "border-transparent text-[#64748B] hover:text-[#0F172A]"
            }`}
          >
            Consent
          </button>
          <button
            onClick={() => setActiveTab("details")}
            className={`flex-1 py-3 px-4 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition-all ${
              activeTab === "details"
                ? "border-[#2E5AAC] text-[#0369A1] bg-white"
                : "border-transparent text-[#64748B] hover:text-[#0F172A]"
            }`}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab("about")}
            className={`flex-1 py-3 px-4 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition-all ${
              activeTab === "about"
                ? "border-[#2E5AAC] text-[#0369A1] bg-white"
                : "border-transparent text-[#64748B] hover:text-[#0F172A]"
            }`}
          >
            About
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 md:p-8 overflow-y-auto space-y-6 text-[#334155] text-xs leading-relaxed flex-grow">
          {/* TAB 1: CONSENT */}
          {activeTab === "consent" && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-[#0F172A]">This website uses cookies</h3>
              <p className="text-xs text-[#475569] leading-relaxed">
                We use cookies to personalize content and ads, to provide secure B2B client portal access, and to analyze our web traffic. We also share information about your site usage with our analytics, marketing, and payment processing partners (such as Stripe) who may combine it with other data you have provided to them.
              </p>
              <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-none flex items-center gap-3">
                <span className="material-symbols-outlined text-[#0369A1]">verified_user</span>
                <span className="text-[11px] text-[#475569]">
                  Strictly necessary session cookies are stored automatically under GDPR Art. 6 (1) (f) to operate the B2B configurator and PDF proforma generator.
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: DETAILS */}
          {activeTab === "details" && (
            <div className="space-y-4">
              {/* Category 1: Necessary */}
              <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-none space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#0F172A] text-xs">Necessary</span>
                    <span className="px-2 py-0.5 rounded-none bg-[#E2E8F0] text-[10px] font-mono font-bold text-[#475569]">
                      40
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={true}
                    disabled={true}
                    className="w-5 h-5 accent-[#0369A1] rounded-none cursor-not-allowed opacity-80"
                  />
                </div>
                <p className="text-[11px] text-[#64748B]">
                  Necessary cookies help make a website usable by enabling basic functions like page navigation, security tokens, and access to secure B2B portal areas. The website cannot function properly without these cookies.
                </p>
              </div>

              {/* Category 2: Preferences */}
              <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-none space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#0F172A] text-xs">Preferences</span>
                    <span className="px-2 py-0.5 rounded-none bg-[#E2E8F0] text-[10px] font-mono font-bold text-[#475569]">
                      15
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={categories.preferences}
                    onChange={(e) => setCategories({ ...categories, preferences: e.target.checked })}
                    className="w-5 h-5 accent-[#0369A1] rounded-none cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-[#64748B]">
                  Preference cookies enable a website to remember information that changes the way the website behaves or looks, like your preferred currency, language, or geographical region.
                </p>
              </div>

              {/* Category 3: Statistics */}
              <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-none space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#0F172A] text-xs">Statistics</span>
                    <span className="px-2 py-0.5 rounded-none bg-[#E2E8F0] text-[10px] font-mono font-bold text-[#475569]">
                      29
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={categories.statistics}
                    onChange={(e) => setCategories({ ...categories, statistics: e.target.checked })}
                    className="w-5 h-5 accent-[#0369A1] rounded-none cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-[#64748B]">
                  Statistic cookies help website owners to understand how visitors interact with websites by collecting and reporting information anonymously.
                </p>
              </div>

              {/* Category 4: Marketing */}
              <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-none space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#0F172A] text-xs">Marketing</span>
                    <span className="px-2 py-0.5 rounded-none bg-[#E2E8F0] text-[10px] font-mono font-bold text-[#475569]">
                      75
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={categories.marketing}
                    onChange={(e) => setCategories({ ...categories, marketing: e.target.checked })}
                    className="w-5 h-5 accent-[#0369A1] rounded-none cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-[#64748B]">
                  Marketing cookies are used to track visitors across websites to display relevant, engaging campaigns for corporate procurement accounts.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: ABOUT */}
          {activeTab === "about" && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-[#0F172A]">About Cookies &amp; Data Rights</h3>
              <p className="text-xs text-[#475569] leading-relaxed">
                Cookies are small text files that can be used by websites to make a user&apos;s experience more efficient. The law states that we can store cookies on your device if they are strictly necessary for the operation of this site. For all other types of cookies we need your permission.
              </p>
              <p className="text-xs text-[#475569] leading-relaxed">
                Satriano Atelier processes all B2B customer portal credentials and corporate specs under ISO 27001 data encryption standards. For full details on how we handle personal data, read our{" "}
                <Link href="/legal/privacy" onClick={() => setIsOpen(false)} className="text-[#0369A1] underline font-semibold">
                  Privacy Policy
                </Link>{" "}
                and{" "}
                <Link href="/legal/cookies" onClick={() => setIsOpen(false)} className="text-[#0369A1] underline font-semibold">
                  Cookie Policy
                </Link>.
              </p>
            </div>
          )}
        </div>

        {/* Action Button Footer */}
        <div className="p-4 bg-[#F8FAFC] border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={handleDeny}
              className="flex-1 sm:flex-initial px-4 py-2.5 border border-[#CBD5E1] bg-white text-[#334155] hover:bg-[#E2E8F0] text-xs font-semibold uppercase tracking-wider rounded-none transition-colors"
            >
              Deny Non-Essential
            </button>
            <button
              onClick={handleAllowSelection}
              className="flex-1 sm:flex-initial px-4 py-2.5 border border-[#0369A1] bg-[#F0F9FF] text-[#0369A1] hover:bg-[#E0F2FE] text-xs font-semibold uppercase tracking-wider rounded-none transition-colors"
            >
              Allow Selection
            </button>
          </div>
          <button
            onClick={handleAllowAll}
            className="w-full sm:w-auto px-6 py-2.5 bg-[#0B1E3D] hover:bg-[#152744] text-white text-xs font-semibold uppercase tracking-wider rounded-none transition-colors shadow-md"
          >
            Allow All Cookies
          </button>
        </div>
      </div>
    </div>
  );
}

export function OpenCookiePreferencesButton() {
  return (
    <button
      type="button"
      onClick={() => {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("open-cookie-preferences"));
        }
      }}
      className="text-[#8DA0C4] hover:text-[#E8ECF3] hover:underline cursor-pointer text-[11px]"
    >
      Cookie Preferences
    </button>
  );
}
