"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { PortalDashboard } from "@/components/portal/PortalDashboard";
import { AtelierLogo } from "@/components/layout/AtelierLogo";

type PortalView = "LOGIN" | "REGISTER" | "SUBMITTED";

function PortalPageContent() {
  const searchParams = useSearchParams();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(false);
  const [view, setView] = useState<PortalView>("LOGIN");

  // Magic link login state
  const [email, setEmail] = useState("");
  const [loginSending, setLoginSending] = useState(false);
  const [loginSuccessMessage, setLoginSuccessMessage] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Application form state
  const [companyName, setCompanyName] = useState("");
  const [website, setWebsite] = useState("");
  const [industry, setIndustry] = useState("Wholesale Apparel");
  const [annualVolume, setAnnualVolume] = useState("500 - 2,000 units");
  const [fullName, setFullName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [corpEmail, setCorpEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [needs, setNeeds] = useState({
    customDye: false,
    bespokeTailoring: false,
    privateLabelPackaging: false,
    expeditedLogistics: false,
  });

  const [regError, setRegError] = useState<string | null>(null);

  // Check customer session on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/customer/session");
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            setIsAuthenticated(true);
            return;
          }
        }
      } catch {
        // Unauthenticated
      }
      setIsAuthenticated(false);
    }
    checkAuth();
  }, []);

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam === "link_expired_or_used") {
      setLoginError("This login link has expired or was already used. Please request a new link.");
    } else if (errorParam === "account_not_approved") {
      setLoginError("Your B2B partner application is not currently approved. Access is restricted to approved corporate partners.");
    } else if (errorParam === "invalid_token" || errorParam === "verification_failed") {
      setLoginError("Invalid or corrupted magic link. Please enter your email to get a new link.");
    }
  }, [searchParams]);

  async function handleMagicLinkSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      setLoginError("Please enter a valid corporate email address.");
      return;
    }

    setLoginError(null);
    setLoginSuccessMessage(null);
    setLoginSending(true);

    try {
      const res = await fetch("/api/portal/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to send magic link.");
      }

      setLoginSuccessMessage(
        json.message || "If an account exists for this email, we've sent a login link."
      );
    } catch (err: any) {
      setLoginError(err.message || "Failed to request magic link. Please try again.");
    } finally {
      setLoginSending(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!companyName.trim() || !corpEmail.trim() || !fullName.trim()) {
      setRegError("Please fill out all required company and contact fields.");
      return;
    }
    setRegError(null);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          website,
          industry,
          annualVolume,
          fullName,
          jobTitle,
          corpEmail,
          phone,
          needs,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to submit application.");
      }

      setView("SUBMITTED");
    } catch (err) {
      console.error(err);
      setRegError("Failed to submit application. Please try again.");
    }
  }

  // 1. AUTHENTICATED CUSTOMER DASHBOARD
  if (isAuthenticated === true) {
    return <PortalDashboard />;
  }

  // 2. LOADING STATE
  if (isAuthenticated === null) {
    return (
      <main className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center font-sans text-xs text-[var(--color-text-secondary)] transition-colors">
        <div className="text-center space-y-2">
          <span className="inline-block w-6 h-6 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
          <p>Verifying client session...</p>
        </div>
      </main>
    );
  }

  // 3. MINIMAL FOCUSED LOGIN / REGISTER SCREENS (UNAUTHENTICATED)
  if (view === "LOGIN" || view === "REGISTER") {
    return (
      <main className="min-h-screen bg-[#F5F7FA] text-[#1A2233] py-12 px-4 md:px-8 flex flex-col justify-center items-center font-sans relative">
        <div className="w-full max-w-xl mx-auto my-auto">
          {/* Centered Real Brand Logo Mark */}
          <div className="text-center mb-6">
            <Link href="/" className="inline-block hover:opacity-90 transition-opacity">
              <AtelierLogo className="h-10 md:h-11 w-auto mx-auto object-contain" />
            </Link>
          </div>

          {/* VIEW 1: CLIENT PORTAL MAGIC LINK LOGIN */}
          {view === "LOGIN" && (
            <div className="bg-white border border-[#D1D5DB] rounded-lg p-8 shadow-sm">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-semibold text-[#1A2233]">
                  Client Portal Access
                </h1>
                <p className="text-xs text-[#5B6B85] mt-1.5 leading-relaxed">
                  Enter your registered corporate email to receive a secure, passwordless magic login link.
                </p>
              </div>

              {loginSuccessMessage ? (
                <div className="p-6 bg-[#E6F1FB] border border-[#B3D6F6] rounded-lg text-center space-y-3">
                  <div className="w-12 h-12 bg-[#2E5AAC] text-white rounded-full flex items-center justify-center mx-auto">
                    <span className="material-symbols-outlined text-2xl">mark_email_read</span>
                  </div>
                  <h3 className="text-sm font-bold text-[#1A2233]">Check Your Corporate Inbox</h3>
                  <p className="text-xs text-[#5B6B85] leading-relaxed">
                    {loginSuccessMessage}
                  </p>
                  <p className="text-[11px] text-[#5B6B85] italic pt-2">
                    The link expires in 15 minutes and can only be used once.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginSuccessMessage(null);
                      setEmail("");
                    }}
                    className="mt-3 text-xs font-semibold text-[#2E5AAC] hover:underline"
                  >
                    ← Send to a different email
                  </button>
                </div>
              ) : (
                <form onSubmit={handleMagicLinkSubmit} className="space-y-5">
                  <div>
                    <label
                      htmlFor="loginEmail"
                      className="block text-xs font-semibold uppercase tracking-wider text-[#5B6B85] mb-1.5"
                    >
                      Corporate Email Address *
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-3 text-[#5B6B85] text-lg">
                        mail
                      </span>
                      <input
                        id="loginEmail"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="executive@company.com"
                        className="w-full pl-10 pr-3 py-3 bg-[#F5F7FA] border border-[#D1D5DB] rounded text-sm text-[#1A2233] focus:border-[#2E5AAC] focus:bg-white focus:outline-none min-h-[44px]"
                      />
                    </div>
                  </div>

                  {loginError && (
                    <div className="p-3.5 bg-[#FCE8E6] border border-[#F8B4B4] rounded text-xs text-[#C5221F] font-medium flex items-center gap-2">
                      <span className="material-symbols-outlined text-base">error</span>
                      <span>{loginError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loginSending}
                    className="w-full min-h-[44px] py-3 bg-[#2E5AAC] hover:bg-[#1E3F7A] disabled:opacity-50 text-white text-xs font-semibold uppercase tracking-wider rounded transition-colors shadow-sm flex items-center justify-center gap-2"
                  >
                    {loginSending ? (
                      <>
                        <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Sending Magic Link...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-base">send</span>
                        <span>Send Passwordless Login Link</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              <div className="mt-8 pt-6 border-t border-[#E5E7EB] text-center">
                <p className="text-xs text-[#5B6B85]">
                  New B2B client? Apply for corporate ordering privileges.
                </p>
                <button
                  type="button"
                  onClick={() => setView("REGISTER")}
                  className="mt-2 min-h-[44px] text-xs font-semibold text-[#2E5AAC] hover:underline uppercase tracking-wider inline-flex items-center gap-1"
                >
                  <span>Become a B2B Partner →</span>
                </button>
              </div>
            </div>
          )}

          {/* VIEW 2: BECOME A B2B PARTNER APPLICATION FORM */}
          {view === "REGISTER" && (
            <div className="bg-white border border-[#D1D5DB] rounded-lg p-8 shadow-sm">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#E6F1FB] text-[#185FA5] text-[10px] font-semibold uppercase tracking-wider rounded mb-2 border border-[#B3D6F6]">
                  Step 1 of 3 • Corporate Account Setup
                </div>
                <h1 className="text-2xl font-semibold text-[#1A2233]">
                  Apply for B2B Partnership
                </h1>
                <p className="text-xs text-[#5B6B85] mt-1.5 leading-relaxed">
                  Join our white-label manufacturing network for custom garment production lines.
                </p>
              </div>

              <form onSubmit={handleRegister} className="space-y-6">
                {/* Section A: Company Information */}
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1A2233] pb-2 border-b border-[#E5E7EB] mb-4">
                    1. Company Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#5B6B85] mb-1">
                        Company Legal Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Apex Brands Ltd."
                        className="w-full px-3 py-2 bg-[#F5F7FA] border border-[#D1D5DB] rounded text-sm text-[#1A2233] focus:border-[#2E5AAC] focus:bg-white focus:outline-none min-h-[44px]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#5B6B85] mb-1">
                        Corporate Website
                      </label>
                      <input
                        type="url"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        placeholder="https://apexbrands.com"
                        className="w-full px-3 py-2 bg-[#F5F7FA] border border-[#D1D5DB] rounded text-sm text-[#1A2233] focus:border-[#2E5AAC] focus:bg-white focus:outline-none min-h-[44px]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#5B6B85] mb-1">
                        Industry / Business Type
                      </label>
                      <select
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        className="w-full px-3 py-2 bg-[#F5F7FA] border border-[#D1D5DB] rounded text-sm text-[#1A2233] focus:border-[#2E5AAC] focus:bg-white focus:outline-none min-h-[44px]"
                      >
                        <option value="Wholesale Apparel">Wholesale Apparel</option>
                        <option value="Fashion Brand / Retailer">Fashion Brand / Retailer</option>
                        <option value="Corporate Merchandising">Corporate Merchandising</option>
                        <option value="Sportswear & Activewear">Sportswear &amp; Activewear</option>
                        <option value="Workwear & Uniforms">Workwear &amp; Uniforms</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#5B6B85] mb-1">
                        Est. Annual Garment Volume
                      </label>
                      <select
                        value={annualVolume}
                        onChange={(e) => setAnnualVolume(e.target.value)}
                        className="w-full px-3 py-2 bg-[#F5F7FA] border border-[#D1D5DB] rounded text-sm text-[#1A2233] focus:border-[#2E5AAC] focus:bg-white focus:outline-none min-h-[44px]"
                      >
                        <option value="100 - 500 units">100 - 500 units / year</option>
                        <option value="500 - 2,000 units">500 - 2,000 units / year</option>
                        <option value="2,000 - 10,000 units">2,000 - 10,000 units / year</option>
                        <option value="10,000+ units">10,000+ units / year</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section B: Contact Representative */}
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1A2233] pb-2 border-b border-[#E5E7EB] mb-4">
                    2. Primary Contact Representative
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#5B6B85] mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Sarah Jenkins"
                        className="w-full px-3 py-2 bg-[#F5F7FA] border border-[#D1D5DB] rounded text-sm text-[#1A2233] focus:border-[#2E5AAC] focus:bg-white focus:outline-none min-h-[44px]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#5B6B85] mb-1">
                        Job Title
                      </label>
                      <input
                        type="text"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        placeholder="Head of Procurement"
                        className="w-full px-3 py-2 bg-[#F5F7FA] border border-[#D1D5DB] rounded text-sm text-[#1A2233] focus:border-[#2E5AAC] focus:bg-white focus:outline-none min-h-[44px]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#5B6B85] mb-1">
                        Corporate Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={corpEmail}
                        onChange={(e) => setCorpEmail(e.target.value)}
                        placeholder="s.jenkins@apexbrands.com"
                        className="w-full px-3 py-2 bg-[#F5F7FA] border border-[#D1D5DB] rounded text-sm text-[#1A2233] focus:border-[#2E5AAC] focus:bg-white focus:outline-none min-h-[44px]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#5B6B85] mb-1">
                        Phone / WhatsApp
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+44 20 7946 0912"
                        className="w-full px-3 py-2 bg-[#F5F7FA] border border-[#D1D5DB] rounded text-sm text-[#1A2233] focus:border-[#2E5AAC] focus:bg-white focus:outline-none min-h-[44px]"
                      />
                    </div>
                  </div>
                </div>

                {/* Section C: Production Requirements */}
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1A2233] pb-2 border-b border-[#E5E7EB] mb-3">
                    3. Specific Production Requirements
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-[#5B6B85]">
                    <label className="flex items-center gap-2 p-2.5 bg-[#F5F7FA] rounded border border-[#E5E7EB] cursor-pointer min-h-[44px]">
                      <input
                        type="checkbox"
                        checked={needs.customDye}
                        onChange={(e) => setNeeds({ ...needs, customDye: e.target.checked })}
                        className="rounded border-[#D1D5DB] text-[#2E5AAC]"
                      />
                      <span>Custom Fabric Dye Lots</span>
                    </label>
                    <label className="flex items-center gap-2 p-2.5 bg-[#F5F7FA] rounded border border-[#E5E7EB] cursor-pointer min-h-[44px]">
                      <input
                        type="checkbox"
                        checked={needs.bespokeTailoring}
                        onChange={(e) => setNeeds({ ...needs, bespokeTailoring: e.target.checked })}
                        className="rounded border-[#D1D5DB] text-[#2E5AAC]"
                      />
                      <span>Bespoke CAD Pattern Grading</span>
                    </label>
                    <label className="flex items-center gap-2 p-2.5 bg-[#F5F7FA] rounded border border-[#E5E7EB] cursor-pointer min-h-[44px]">
                      <input
                        type="checkbox"
                        checked={needs.privateLabelPackaging}
                        onChange={(e) => setNeeds({ ...needs, privateLabelPackaging: e.target.checked })}
                        className="rounded border-[#D1D5DB] text-[#2E5AAC]"
                      />
                      <span>Private Label Packaging &amp; Hangtags</span>
                    </label>
                    <label className="flex items-center gap-2 p-2.5 bg-[#F5F7FA] rounded border border-[#E5E7EB] cursor-pointer min-h-[44px]">
                      <input
                        type="checkbox"
                        checked={needs.expeditedLogistics}
                        onChange={(e) => setNeeds({ ...needs, expeditedLogistics: e.target.checked })}
                        className="rounded border-[#D1D5DB] text-[#2E5AAC]"
                      />
                      <span>Expedited Air Freight Delivery</span>
                    </label>
                  </div>
                </div>

                {regError && (
                  <div className="p-3 bg-[#FCE8E6] border border-[#F8B4B4] rounded text-xs text-[#C5221F]">
                    {regError}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setView("LOGIN")}
                    className="w-1/3 min-h-[44px] py-3 bg-[#F5F7FA] hover:bg-[#E5E7EB] text-[#5B6B85] text-xs font-semibold uppercase tracking-wider rounded border border-[#D1D5DB] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 min-h-[44px] py-3 bg-[#2E5AAC] hover:bg-[#1E3F7A] text-white text-xs font-semibold uppercase tracking-wider rounded transition-colors shadow-sm"
                  >
                    Submit Partnership Application
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>
    );
  }

  // 4. SUBMITTED CONFIRMATION VIEW
  return (
    <>
      <main className="min-h-screen bg-[#F5F7FA] text-[#1A2233] py-16 px-4 md:px-8 flex flex-col justify-center items-center font-sans">
        <div className="w-full max-w-xl mx-auto">
          <div className="bg-white border border-[#D1D5DB] rounded-lg p-8 shadow-sm text-center">
            <div className="w-16 h-16 bg-[#FAEEDA] text-[#854F0B] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#F5D8A0]">
              <span className="material-symbols-outlined text-3xl">mark_email_unread</span>
            </div>

            <span className="bg-[#FAEEDA] text-[#854F0B] text-[10px] uppercase font-semibold px-3 py-1.5 rounded border border-[#F5D8A0] inline-flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">pending_actions</span>
              <span>Application Received • Verify Your Email</span>
            </span>

            <h1 className="text-2xl font-semibold text-[#1A2233] mt-4">
              Please Verify Your Corporate Email
            </h1>

            <p className="text-xs text-[#5B6B85] mt-3 max-w-lg mx-auto leading-relaxed">
              We&apos;ve sent a verification link to <strong>{corpEmail || "your email address"}</strong>. Please check your inbox and click the link to confirm your email — your application for <strong>{companyName || "your company"}</strong> will then be reviewed by our B2B account team.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
              <Link
                href="/"
                className="min-h-[44px] inline-flex items-center justify-center bg-[#2E5AAC] hover:bg-[#24498E] text-white text-xs font-semibold uppercase tracking-wider px-6 py-3 rounded transition-colors"
              >
                Back to Homepage
              </Link>
              <Link
                href="/categories"
                className="min-h-[44px] inline-flex items-center justify-center bg-[#F5F7FA] hover:bg-[#E6F1FB] text-[#1A2233] hover:text-[#2E5AAC] border border-[#D1D5DB] text-xs font-semibold uppercase tracking-wider px-6 py-3 rounded transition-colors"
              >
                Browse Product Catalog
              </Link>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

export default function PortalPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center font-sans text-xs text-[var(--color-text-secondary)] transition-colors">
          <span className="inline-block w-5 h-5 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin mb-2" />
        </div>
      }
    >
      <PortalPageContent />
    </Suspense>
  );
}
