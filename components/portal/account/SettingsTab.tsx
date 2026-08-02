"use client";

import React, { useState } from "react";

export function SettingsTab() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [autoDownloadProforma, setAutoDownloadProforma] = useState(false);
  const [currency, setCurrency] = useState("USD");
  const [language, setLanguage] = useState("en-US");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [themeMode, setThemeMode] = useState<"light" | "dark">("light");

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const current = (document.documentElement.getAttribute("data-theme") as "light" | "dark") || "light";
      setThemeMode(current);
    }
  }, []);

  const handleToggleTheme = () => {
    const next = themeMode === "dark" ? "light" : "dark";
    setThemeMode(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("satriano-theme", next);
    } catch (e) {}
    setStatusMessage(`Interface theme updated to ${next.toUpperCase()} mode.`);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  function handleSaveSettings() {
    setStatusMessage("Account preferences updated.");
    setTimeout(() => setStatusMessage(null), 3000);
  }

  return (
    <div className="bg-[#132A52] border border-[#2E5AAC] rounded-none p-6 md:p-8 text-[#E8ECF3] shadow-none space-y-6">
      <div className="flex items-center justify-between border-b border-[#2E5AAC]/40 pb-4">
        <div>
          <h2 className="text-base font-bold uppercase tracking-wider font-mono flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#2E5AAC] rounded-none" />
            Account Preferences &amp; Security
          </h2>
          <p className="text-xs text-[#8DA0C4] mt-1">
            Notification Rules, Localization &amp; Credential Actions
          </p>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 bg-[#14301F] border border-[#5DCAA5] text-xs text-[#5DCAA5] font-semibold">
          {statusMessage}
        </div>
      )}

      {/* Preferences Grid */}
      <div className="space-y-6">
        {/* Section 1: Toggles */}
        <div className="space-y-4 font-mono text-xs">
          {/* Theme Mode Toggle */}
          <div className="flex items-center justify-between p-4 bg-[#0B1E3D] border border-[#1E3A8A] rounded-none">
            <div>
              <span className="font-bold text-white block">Theme Mode ({themeMode === "dark" ? "Dark Theme 🌙" : "Light Theme ☀️"})</span>
              <span className="text-[#8DA0C4] text-[11px] block mt-0.5 font-sans">
                Interface color palette preference for Public site &amp; B2B Customer Portal.
              </span>
            </div>
            <button
              type="button"
              onClick={handleToggleTheme}
              className={`px-3 py-1.5 border border-[#2E5AAC] font-mono text-xs font-bold uppercase tracking-wider rounded-none cursor-pointer transition-colors flex items-center gap-1.5 ${
                themeMode === "dark"
                  ? "bg-[#2E5AAC] text-white"
                  : "bg-white text-[#1A2233]"
              }`}
            >
              <span className="material-symbols-outlined text-sm">
                {themeMode === "dark" ? "light_mode" : "dark_mode"}
              </span>
              <span>{themeMode === "dark" ? "Dark Mode" : "Light Mode"}</span>
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-[#0B1E3D] border border-[#1E3A8A] rounded-none">
            <div>
              <span className="font-bold text-white block">Email Notifications</span>
              <span className="text-[#8DA0C4] text-[11px] block mt-0.5 font-sans">
                Receive proforma invoices and production status updates via email.
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setEmailNotifications(!emailNotifications);
                handleSaveSettings();
              }}
              className={`w-12 h-6 flex items-center p-1 rounded-none cursor-pointer transition-colors ${
                emailNotifications ? "bg-[#2E5AAC] justify-end" : "bg-[#1E3A8A] justify-start"
              }`}
            >
              <span className="w-4 h-4 bg-white rounded-none shadow" />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-[#0B1E3D] border border-[#1E3A8A] rounded-none">
            <div>
              <span className="font-bold text-white block">Proforma Auto-Download</span>
              <span className="text-[#8DA0C4] text-[11px] block mt-0.5 font-sans">
                Automatically download PDF proforma when approved by atelier.
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setAutoDownloadProforma(!autoDownloadProforma);
                handleSaveSettings();
              }}
              className={`w-12 h-6 flex items-center p-1 rounded-none cursor-pointer transition-colors ${
                autoDownloadProforma ? "bg-[#2E5AAC] justify-end" : "bg-[#1E3A8A] justify-start"
              }`}
            >
              <span className="w-4 h-4 bg-white rounded-none shadow" />
            </button>
          </div>
        </div>

        {/* Section 2: Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          <div className="space-y-1 p-4 bg-[#0B1E3D] border border-[#1E3A8A] rounded-none">
            <label className="text-[#8DA0C4] uppercase block text-[10px] mb-1">Default Currency</label>
            <select
              value={currency}
              onChange={(e) => {
                setCurrency(e.target.value);
                handleSaveSettings();
              }}
              className="w-full bg-[#132A52] border border-[#2E5AAC] text-white p-2.5 text-xs rounded-none focus:outline-none"
            >
              <option value="USD">USD ($ USD)</option>
              <option value="EUR">EUR (€ EUR)</option>
              <option value="GBP">GBP (£ GBP)</option>
            </select>
          </div>

          <div className="space-y-1 p-4 bg-[#0B1E3D] border border-[#1E3A8A] rounded-none">
            <label className="text-[#8DA0C4] uppercase block text-[10px] mb-1">Language</label>
            <select
              value={language}
              onChange={(e) => {
                setLanguage(e.target.value);
                handleSaveSettings();
              }}
              className="w-full bg-[#132A52] border border-[#2E5AAC] text-white p-2.5 text-xs rounded-none focus:outline-none"
            >
              <option value="en-US">English (en-US)</option>
              <option value="en-GB">English International (en-GB)</option>
            </select>
          </div>
        </div>

        {/* Section 3: Credential & Security Actions */}
        <div className="pt-4 border-t border-[#2E5AAC]/30 flex flex-col sm:flex-row justify-between gap-4">
          <button
            type="button"
            onClick={() => alert("Password reset link sent to your registered corporate email.")}
            className="h-10 px-5 bg-[#0B1E3D] hover:bg-[#1E3A6D] text-[#85B7EB] border border-[#2E5AAC] text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2 rounded-none transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">lock_reset</span>
            <span>Change Password / Security Credentials</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (confirm("Are you sure you want to request account deletion? Your B2B partner access will be suspended.")) {
                alert("Account deletion request transmitted to Satriano B2B compliance team.");
              }
            }}
            className="h-10 px-5 bg-[#3A1414] hover:bg-[#5C1D1D] text-[#F8B4B4] border border-[#C5221F] text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2 rounded-none transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">delete_forever</span>
            <span>Delete Account</span>
          </button>
        </div>
      </div>
    </div>
  );
}
