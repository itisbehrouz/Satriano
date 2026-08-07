"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { adminDictionary, type AdminLanguage, type AdminDictionary } from "@/lib/i18n/admin-dictionary";

const STORAGE_KEY = "satriano-admin-lang";

interface AdminLanguageContextType {
  language: AdminLanguage;
  setLanguage: (lang: AdminLanguage) => void;
  t: AdminDictionary;
}

const AdminLanguageContext = createContext<AdminLanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: adminDictionary.en,
});

export function AdminLanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<AdminLanguage>("en");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY) as AdminLanguage | null;
      if (saved === "en" || saved === "tr") {
        setLanguageState(saved);
      }
    }
  }, []);

  const setLanguage = (lang: AdminLanguage) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, lang);
      } catch (e) {
        console.error("Failed to persist admin language:", e);
      }
    }
  };

  const t = adminDictionary[language] || adminDictionary.en;

  return (
    <AdminLanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </AdminLanguageContext.Provider>
  );
}

export function useAdminLanguage() {
  return useContext(AdminLanguageContext);
}
