"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const MENU_ITEMS = [
  { label: "MANUFACTURING", href: "/konfigurator" },
  { label: "COLLECTIONS", href: "/categories" },
  { label: "SOURCING", href: "#sourcing" },
  { label: "WHOLESALE", href: "#wholesale" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="bg-[#0B1E3D] text-[#E8ECF3] border-b border-[#132A52] sticky top-0 z-50 w-full shadow-sm">
      <div className="flex justify-between items-center w-full px-4 md:px-8 py-3.5 max-w-container-max mx-auto">
        {/* Official Brand Logo Image */}
        <Link
          href="/"
          className="flex items-center gap-3 hover:opacity-95 transition-opacity"
        >
          <img
            src="/Satrinao.png"
            alt="Satriano Atelier"
            className="h-[45px] md:h-[50px] w-auto object-contain"
          />
        </Link>

        {/* Navigation Items */}
        <nav className="hidden md:flex gap-8 items-center text-xs font-semibold tracking-wider uppercase">
          {MENU_ITEMS.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`relative py-1 transition-colors ${
                  isActive
                    ? "text-[#E8ECF3] border-b-2 border-[#DBB671]"
                    : "text-[#8DA0C4] hover:text-[#E8ECF3]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Primary Action Button: Client Portal with Icon */}
        <div className="flex items-center gap-4">
          <Link
            href="/portal"
            className="bg-[#2E5AAC] hover:bg-[#24498E] text-white text-xs uppercase font-semibold tracking-wider px-5 py-2.5 rounded transition-colors inline-flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-base">account_circle</span>
            Client Portal
          </Link>
        </div>
      </div>
    </header>
  );
}
