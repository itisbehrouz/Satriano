"use client";

import { useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

type PortalView = "LOGIN" | "REGISTER" | "SUBMITTED";

export default function PortalPage() {
  const [view, setView] = useState<PortalView>("LOGIN");

  // Login form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setLoginError("Please enter your corporate email and password.");
      return;
    }
    setLoginError(null);
    // Redirect to configurator upon successful login credentials
    window.location.href = "/konfigurator";
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

  // 1. MINIMAL FOCUSED LOGIN / REGISTER SCREENS (No Header/Footer, Fixed Return Icon, Centered Logo + Form)
  if (view === "LOGIN" || view === "REGISTER") {
    return (
      <main className="min-h-screen bg-[#F5F7FA] text-[#1A2233] py-12 px-4 md:px-8 flex flex-col justify-center items-center font-sans relative">
        {/* Fixed Top-Left Return Link */}
        <Link
          href="/"
          className="fixed top-6 left-6 inline-flex items-center gap-2 min-h-[44px] px-4 py-2.5 text-xs font-semibold text-[#5B6B85] hover:text-[#1A2233] bg-white border border-[#D1D5DB] rounded shadow-sm transition-colors z-50"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          <span>Return to Homepage</span>
        </Link>

        <div className="w-full max-w-xl mx-auto my-auto">
          {/* Centered Brand Logo */}
          <div className="text-center mb-6">
            <Link href="/" className="inline-block">
              <img
                src="/Satrinao.png"
                alt="Satriano Atelier"
                className="h-10 md:h-11 w-auto mx-auto object-contain"
              />
            </Link>
          </div>

          {/* VIEW 1: CLIENT PORTAL LOGIN */}
          {view === "LOGIN" && (
            <div className="bg-white border border-[#D1D5DB] rounded-lg p-8 shadow-sm">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-semibold text-[#1A2233]">
                  Client Portal Access
                </h1>
                <p className="text-xs text-[#5B6B85] mt-1.5 leading-relaxed">
                  Access your custom orders, sizing configurations, and live proforma quotes.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label
                    htmlFor="loginEmail"
                    className="block text-xs font-semibold uppercase tracking-wider text-[#5B6B85] mb-1.5"
                  >
                    Corporate Email Address *
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#5B6B85] text-lg">
                      mail
                    </span>
                    <input
                      id="loginEmail"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="executive@company.com"
                      className="w-full pl-10 pr-3 py-2.5 bg-[#F5F7FA] border border-[#D1D5DB] rounded text-sm text-[#1A2233] focus:border-[#2E5AAC] focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label
                      htmlFor="loginPassword"
                      className="block text-xs font-semibold uppercase tracking-wider text-[#5B6B85]"
                    >
                      Password *
                    </label>
                    <a
                      href="#forgot"
                      className="text-xs font-medium text-[#2E5AAC] hover:underline"
                    >
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#5B6B85] text-lg">
                      lock
                    </span>
                    <input
                      id="loginPassword"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-3 py-2.5 bg-[#F5F7FA] border border-[#D1D5DB] rounded text-sm text-[#1A2233] focus:border-[#2E5AAC] focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                {loginError && (
                  <div className="p-3 bg-[#FCE8E6] border border-[#F8B4B4] rounded text-xs text-[#C5221F]">
                    {loginError}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-[#2E5AAC] hover:bg-[#1E3F7A] text-white text-xs font-semibold uppercase tracking-wider rounded transition-colors shadow-sm"
                >
                  Sign In to Client Portal
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-[#E5E7EB] text-center">
                <p className="text-xs text-[#5B6B85]">
                  New B2B client? Apply for corporate ordering privileges.
                </p>
                <button
                  onClick={() => setView("REGISTER")}
                  className="mt-2 text-xs font-semibold text-[#2E5AAC] hover:underline uppercase tracking-wider"
                >
                  Become a B2B Partner →
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
                        className="w-full px-3 py-2 bg-[#F5F7FA] border border-[#D1D5DB] rounded text-sm text-[#1A2233] focus:border-[#2E5AAC] focus:bg-white focus:outline-none"
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
                        className="w-full px-3 py-2 bg-[#F5F7FA] border border-[#D1D5DB] rounded text-sm text-[#1A2233] focus:border-[#2E5AAC] focus:bg-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#5B6B85] mb-1">
                        Industry / Business Type
                      </label>
                      <select
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        className="w-full px-3 py-2 bg-[#F5F7FA] border border-[#D1D5DB] rounded text-sm text-[#1A2233] focus:border-[#2E5AAC] focus:bg-white focus:outline-none"
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
                        className="w-full px-3 py-2 bg-[#F5F7FA] border border-[#D1D5DB] rounded text-sm text-[#1A2233] focus:border-[#2E5AAC] focus:bg-white focus:outline-none"
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
                        className="w-full px-3 py-2 bg-[#F5F7FA] border border-[#D1D5DB] rounded text-sm text-[#1A2233] focus:border-[#2E5AAC] focus:bg-white focus:outline-none"
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
                        className="w-full px-3 py-2 bg-[#F5F7FA] border border-[#D1D5DB] rounded text-sm text-[#1A2233] focus:border-[#2E5AAC] focus:bg-white focus:outline-none"
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
                        className="w-full px-3 py-2 bg-[#F5F7FA] border border-[#D1D5DB] rounded text-sm text-[#1A2233] focus:border-[#2E5AAC] focus:bg-white focus:outline-none"
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
                        className="w-full px-3 py-2 bg-[#F5F7FA] border border-[#D1D5DB] rounded text-sm text-[#1A2233] focus:border-[#2E5AAC] focus:bg-white focus:outline-none"
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
                    <label className="flex items-center gap-2 p-2.5 bg-[#F5F7FA] rounded border border-[#E5E7EB] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={needs.customDye}
                        onChange={(e) => setNeeds({ ...needs, customDye: e.target.checked })}
                        className="rounded border-[#D1D5DB] text-[#2E5AAC]"
                      />
                      <span>Custom Fabric Dye Lots</span>
                    </label>
                    <label className="flex items-center gap-2 p-2.5 bg-[#F5F7FA] rounded border border-[#E5E7EB] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={needs.bespokeTailoring}
                        onChange={(e) => setNeeds({ ...needs, bespokeTailoring: e.target.checked })}
                        className="rounded border-[#D1D5DB] text-[#2E5AAC]"
                      />
                      <span>Bespoke CAD Pattern Grading</span>
                    </label>
                    <label className="flex items-center gap-2 p-2.5 bg-[#F5F7FA] rounded border border-[#E5E7EB] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={needs.privateLabelPackaging}
                        onChange={(e) => setNeeds({ ...needs, privateLabelPackaging: e.target.checked })}
                        className="rounded border-[#D1D5DB] text-[#2E5AAC]"
                      />
                      <span>Private Label Packaging &amp; Hangtags</span>
                    </label>
                    <label className="flex items-center gap-2 p-2.5 bg-[#F5F7FA] rounded border border-[#E5E7EB] cursor-pointer">
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
                    className="w-1/3 py-3 bg-[#F5F7FA] hover:bg-[#E5E7EB] text-[#5B6B85] text-xs font-semibold uppercase tracking-wider rounded border border-[#D1D5DB] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 py-3 bg-[#2E5AAC] hover:bg-[#1E3F7A] text-white text-xs font-semibold uppercase tracking-wider rounded transition-colors shadow-sm"
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

  // 2. SUBMITTED CONFIRMATION VIEW (Retains Full Header & Footer Layout)
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-[#F5F7FA] text-[#1A2233] py-16 px-4 md:px-8 flex flex-col justify-center items-center font-sans">
        <div className="w-full max-w-xl mx-auto">
          <div className="bg-white border border-[#D1D5DB] rounded-lg p-8 shadow-sm text-center">
            <div className="w-16 h-16 bg-[#E6F1FB] text-[#2E5AAC] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#B3D6F6]">
              <span className="material-symbols-outlined text-3xl">task_alt</span>
            </div>

            <span className="bg-[#E6F1FB] text-[#185FA5] text-[10px] uppercase font-semibold px-3 py-1 rounded border border-[#B3D6F6]">
              Application Received • Under Review
            </span>

            <h1 className="text-2xl font-semibold text-[#1A2233] mt-4">
              Partnership Application Submitted
            </h1>

            <p className="text-xs text-[#5B6B85] mt-2 max-w-md mx-auto leading-relaxed">
              Thank you for submitting your corporate details for <strong>{companyName || "your company"}</strong>. Our B2B account management team is reviewing your profile and will contact <strong>{corpEmail || "your email"}</strong> within 1 business day.
            </p>

            <div className="mt-8 p-4 bg-[#F5F7FA] border border-[#E5E7EB] rounded text-left space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#1A2233]">
                Next Steps in the Onboarding Process:
              </h4>
              <div className="space-y-2 text-xs text-[#5B6B85]">
                <div className="flex gap-2">
                  <span className="font-mono text-[#2E5AAC] font-bold">1.</span>
                  <span><strong>Verification:</strong> Tax registration &amp; corporate domain check.</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-mono text-[#2E5AAC] font-bold">2.</span>
                  <span><strong>Access Key:</strong> Secure invitation token sent via email.</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-mono text-[#2E5AAC] font-bold">3.</span>
                  <span><strong>First Order:</strong> Instant configurator access with custom MOQs.</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
              <Link
                href="/"
                className="bg-[#2E5AAC] hover:bg-[#24498E] text-white text-xs font-semibold uppercase tracking-wider px-6 py-3 rounded transition-colors"
              >
                Back to Homepage
              </Link>
              <Link
                href="/konfigurator"
                className="bg-[#F5F7FA] hover:bg-[#E6F1FB] text-[#1A2233] hover:text-[#2E5AAC] border border-[#D1D5DB] text-xs font-semibold uppercase tracking-wider px-6 py-3 rounded transition-colors"
              >
                Launch Order Configurator
              </Link>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
