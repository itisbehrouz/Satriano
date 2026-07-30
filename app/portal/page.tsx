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

  // Registration form state
  const [companyName, setCompanyName] = useState("");
  const [website, setWebsite] = useState("");
  const [industry, setIndustry] = useState("Wholesale Apparel");
  const [annualVolume, setAnnualVolume] = useState("500 - 2,000 units");

  const [fullName, setFullName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [corpEmail, setCorpEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [needs, setNeeds] = useState({
    bespokeTailoring: true,
    bulkOrders: false,
    rawMaterials: false,
    sourcingServices: false,
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

  function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!companyName.trim() || !corpEmail.trim() || !fullName.trim()) {
      setRegError("Please fill out all required company and contact fields.");
      return;
    }
    setRegError(null);
    setView("SUBMITTED");
  }

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-[#F5F7FA] text-[#1A2233] py-12 px-4 md:px-8 flex flex-col justify-center items-center font-sans">
        <div className="w-full max-w-xl mx-auto">
          {/* Logo Brand Lockup (The ONLY place Baskerville + Gold #DBB671 appear together) */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block group">
              <img
                src="/Satrinao.png"
                alt="Satriano Atelier"
                className="h-10 md:h-12 w-auto mx-auto object-contain"
              />
              <span className="text-[11px] font-sans uppercase tracking-widest text-[#5B6B85] mt-2 block">
                B2B Manufacturing Portal
              </span>
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
                      onClick={(e) => {
                        e.preventDefault();
                        alert("Password reset instructions sent to your registered corporate email.");
                      }}
                      className="text-[11px] font-medium text-[#2E5AAC] hover:underline"
                    >
                      Forgot Password?
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
                      placeholder="••••••••"
                      className="w-full pl-10 pr-3 py-2.5 bg-[#F5F7FA] border border-[#D1D5DB] rounded text-sm text-[#1A2233] focus:border-[#2E5AAC] focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                {loginError && (
                  <div className="p-3 bg-[#FCEBEB] border border-[#A32D2D] text-[#A32D2D] text-xs rounded">
                    {loginError}
                  </div>
                )}

                {/* Primary Action: Accent Blue #2E5AAC (No Gold Button Fills) */}
                <button
                  type="submit"
                  className="w-full bg-[#2E5AAC] hover:bg-[#24498E] text-white text-xs font-semibold uppercase tracking-wider py-3.5 px-6 rounded transition-colors flex items-center justify-center gap-2"
                >
                  Sign In to Portal →
                </button>
              </form>

              <div className="relative my-6 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#E5E7EB]" />
                </div>
                <span className="relative bg-white px-3 text-[11px] uppercase font-semibold text-[#5B6B85]">
                  OR
                </span>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setView("REGISTER")}
                  className="w-full bg-[#F5F7FA] hover:bg-[#E6F1FB] hover:text-[#2E5AAC] border border-[#D1D5DB] text-[#1A2233] text-xs font-semibold uppercase tracking-wider py-3 px-6 rounded transition-colors text-center block"
                >
                  Request B2B Corporate Account
                </button>
                <Link
                  href="/konfigurator"
                  className="w-full text-[#2E5AAC] hover:underline text-xs font-semibold text-center block py-1"
                >
                  Direct Guest Order Configurator →
                </Link>
              </div>

              <div className="mt-8 pt-4 border-t border-[#E5E7EB] text-center text-[11px] text-[#5B6B85] flex justify-center gap-4">
                <a href="#security" className="hover:underline">
                  Security Policy
                </a>
                <span>•</span>
                <a href="#terms" className="hover:underline">
                  Terms of Service
                </a>
              </div>
            </div>
          )}

          {/* VIEW 2: BECOME A PARTNER / CORPORATE ACCOUNT APPLICATION */}
          {view === "REGISTER" && (
            <div className="bg-white border border-[#D1D5DB] rounded-lg p-8 shadow-sm">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-semibold text-[#1A2233]">
                  Become a B2B Partner
                </h1>
                <p className="text-xs text-[#5B6B85] mt-1.5 leading-relaxed">
                  Apply for a corporate account to access our bespoke configurator, volume pricing, and global logistics support.
                </p>
              </div>

              {/* Step Progress Bar */}
              <div className="grid grid-cols-3 gap-2 mb-8 text-center text-xs font-semibold">
                <div className="bg-[#E6F1FB] text-[#185FA5] border border-[#B3D6F6] py-2 rounded">
                  1. Business Details
                </div>
                <div className="bg-[#F5F7FA] text-[#5B6B85] border border-[#E5E7EB] py-2 rounded">
                  2. Contact Info
                </div>
                <div className="bg-[#F5F7FA] text-[#5B6B85] border border-[#E5E7EB] py-2 rounded">
                  3. Requirements
                </div>
              </div>

              <form onSubmit={handleRegister} className="space-y-6">
                {/* Company Information */}
                <div>
                  <h2 className="text-sm font-semibold text-[#1A2233] uppercase tracking-wider mb-3 flex items-center gap-2 border-b border-[#E5E7EB] pb-2">
                    <span className="material-symbols-outlined text-[#2E5AAC] text-base">
                      domain
                    </span>
                    Company Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#5B6B85] mb-1">
                        Company Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Atelier Holdings LLC"
                        className="w-full px-3 py-2 bg-[#F5F7FA] border border-[#D1D5DB] rounded text-xs text-[#1A2233] focus:border-[#2E5AAC] focus:bg-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#5B6B85] mb-1">
                        Website URL
                      </label>
                      <input
                        type="text"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        placeholder="https://company.com"
                        className="w-full px-3 py-2 bg-[#F5F7FA] border border-[#D1D5DB] rounded text-xs text-[#1A2233] focus:border-[#2E5AAC] focus:bg-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#5B6B85] mb-1">
                        Industry
                      </label>
                      <select
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        className="w-full px-3 py-2 bg-[#F5F7FA] border border-[#D1D5DB] rounded text-xs text-[#1A2233] focus:border-[#2E5AAC] focus:bg-white focus:outline-none"
                      >
                        <option value="Wholesale Apparel">Wholesale Apparel</option>
                        <option value="Luxury Retail Brand">Luxury Retail Brand</option>
                        <option value="Corporate Uniforms">Corporate Uniforms</option>
                        <option value="Hospitality & Hotel Group">Hospitality &amp; Hotel Group</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#5B6B85] mb-1">
                        Annual Volume Est.
                      </label>
                      <select
                        value={annualVolume}
                        onChange={(e) => setAnnualVolume(e.target.value)}
                        className="w-full px-3 py-2 bg-[#F5F7FA] border border-[#D1D5DB] rounded text-xs text-[#1A2233] focus:border-[#2E5AAC] focus:bg-white focus:outline-none"
                      >
                        <option value="100 - 500 units">100 - 500 units / year</option>
                        <option value="500 - 2,000 units">500 - 2,000 units / year</option>
                        <option value="2,000 - 10,000 units">2,000 - 10,000 units / year</option>
                        <option value="10,000+ units">10,000+ units / year</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Contact Representative */}
                <div>
                  <h2 className="text-sm font-semibold text-[#1A2233] uppercase tracking-wider mb-3 flex items-center gap-2 border-b border-[#E5E7EB] pb-2">
                    <span className="material-symbols-outlined text-[#2E5AAC] text-base">
                      person
                    </span>
                    Contact Representative
                  </h2>
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
                        placeholder="John Doe"
                        className="w-full px-3 py-2 bg-[#F5F7FA] border border-[#D1D5DB] rounded text-xs text-[#1A2233] focus:border-[#2E5AAC] focus:bg-white focus:outline-none"
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
                        className="w-full px-3 py-2 bg-[#F5F7FA] border border-[#D1D5DB] rounded text-xs text-[#1A2233] focus:border-[#2E5AAC] focus:bg-white focus:outline-none"
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
                        placeholder="johndoe@company.com"
                        className="w-full px-3 py-2 bg-[#F5F7FA] border border-[#D1D5DB] rounded text-xs text-[#1A2233] focus:border-[#2E5AAC] focus:bg-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#5B6B85] mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="w-full px-3 py-2 bg-[#F5F7FA] border border-[#D1D5DB] rounded text-xs text-[#1A2233] focus:border-[#2E5AAC] focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Manufacturing Needs */}
                <div>
                  <h2 className="text-sm font-semibold text-[#1A2233] uppercase tracking-wider mb-3 flex items-center gap-2 border-b border-[#E5E7EB] pb-2">
                    <span className="material-symbols-outlined text-[#2E5AAC] text-base">
                      manufacturing
                    </span>
                    Manufacturing Needs
                  </h2>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer bg-[#F5F7FA] p-2.5 rounded border border-[#E5E7EB]">
                      <input
                        type="checkbox"
                        checked={needs.bespokeTailoring}
                        onChange={(e) =>
                          setNeeds({ ...needs, bespokeTailoring: e.target.checked })
                        }
                        className="text-[#2E5AAC] focus:ring-[#2E5AAC]"
                      />
                      <span className="font-medium text-[#1A2233]">Bespoke Tailoring</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer bg-[#F5F7FA] p-2.5 rounded border border-[#E5E7EB]">
                      <input
                        type="checkbox"
                        checked={needs.bulkOrders}
                        onChange={(e) =>
                          setNeeds({ ...needs, bulkOrders: e.target.checked })
                        }
                        className="text-[#2E5AAC] focus:ring-[#2E5AAC]"
                      />
                      <span className="font-medium text-[#1A2233]">Bulk Orders</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer bg-[#F5F7FA] p-2.5 rounded border border-[#E5E7EB]">
                      <input
                        type="checkbox"
                        checked={needs.rawMaterials}
                        onChange={(e) =>
                          setNeeds({ ...needs, rawMaterials: e.target.checked })
                        }
                        className="text-[#2E5AAC] focus:ring-[#2E5AAC]"
                      />
                      <span className="font-medium text-[#1A2233]">Raw Materials</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer bg-[#F5F7FA] p-2.5 rounded border border-[#E5E7EB]">
                      <input
                        type="checkbox"
                        checked={needs.sourcingServices}
                        onChange={(e) =>
                          setNeeds({ ...needs, sourcingServices: e.target.checked })
                        }
                        className="text-[#2E5AAC] focus:ring-[#2E5AAC]"
                      />
                      <span className="font-medium text-[#1A2233]">Sourcing Services</span>
                    </label>
                  </div>
                </div>

                {regError && (
                  <div className="p-3 bg-[#FCEBEB] border border-[#A32D2D] text-[#A32D2D] text-xs rounded">
                    {regError}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-[#2E5AAC] hover:bg-[#24498E] text-white text-xs font-semibold uppercase tracking-wider py-3.5 px-6 rounded transition-colors flex items-center justify-center gap-2"
                >
                  Submit Partnership Application →
                </button>
              </form>

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => setView("LOGIN")}
                  className="text-xs text-[#2E5AAC] hover:underline font-medium"
                >
                  Already have an account? Sign In
                </button>
              </div>
            </div>
          )}

          {/* VIEW 3: APPLICATION SUBMITTED CONFIRMATION */}
          {view === "SUBMITTED" && (
            <div className="bg-white border border-[#D1D5DB] rounded-lg p-8 md:p-10 shadow-sm text-center">
              <div className="w-14 h-14 bg-[#E1F5EE] text-[#0F6E56] border border-[#A6E5CE] rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="material-symbols-outlined text-3xl">check_circle</span>
              </div>

              <h1 className="text-2xl font-semibold text-[#1A2233] mb-3">
                Application Submitted
              </h1>
              <p className="text-xs md:text-sm text-[#5B6B85] max-w-md mx-auto leading-relaxed mb-8">
                Thank you for your interest in Satriano Atelier. Our B2B compliance team is reviewing your business credentials. You will receive a response within 24-48 hours.
              </p>

              {/* Process Steps */}
              <div className="border-t border-b border-[#E5E7EB] py-6 my-6">
                <div className="text-xs uppercase font-semibold tracking-wider text-[#1A2233] mb-6">
                  What Happens Next
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="bg-[#F5F7FA] p-4 rounded border border-[#E5E7EB]">
                    <div className="text-xs font-bold text-[#2E5AAC] mb-1 font-mono">01</div>
                    <div className="text-xs font-semibold text-[#1A2233] mb-1">
                      Document Verification
                    </div>
                    <div className="text-[11px] text-[#5B6B85]">
                      Compliance team reviews your industry credentials.
                    </div>
                  </div>

                  <div className="bg-[#F5F7FA] p-4 rounded border border-[#E5E7EB]">
                    <div className="text-xs font-bold text-[#2E5AAC] mb-1 font-mono">02</div>
                    <div className="text-xs font-semibold text-[#1A2233] mb-1">
                      Expert Allocation
                    </div>
                    <div className="text-[11px] text-[#5B6B85]">
                      A dedicated account manager is assigned to your profile.
                    </div>
                  </div>

                  <div className="bg-[#F5F7FA] p-4 rounded border border-[#E5E7EB]">
                    <div className="text-xs font-bold text-[#2E5AAC] mb-1 font-mono">03</div>
                    <div className="text-xs font-semibold text-[#1A2233] mb-1">
                      Portal Access
                    </div>
                    <div className="text-[11px] text-[#5B6B85]">
                      Upon approval, receive credentials to our bespoke configurator.
                    </div>
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
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
