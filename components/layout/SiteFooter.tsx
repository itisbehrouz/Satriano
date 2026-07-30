import Link from "next/link";

const FOOTER_NAV = [
  { label: "MANUFACTURING", href: "/konfigurator" },
  { label: "COLLECTIONS", href: "/categories" },
  { label: "CLIENT PORTAL", href: "/portal" },
  { label: "WHOLESALE", href: "#wholesale" },
];

export function SiteFooter() {
  return (
    <footer className="bg-[#0B1E3D] text-[#E8ECF3] border-t border-[#132A52] w-full mt-auto">
      <div className="flex flex-col md:flex-row justify-between items-center w-full px-4 md:px-8 py-8 gap-6 max-w-container-max mx-auto">
        <Link href="/" className="flex items-center gap-3 hover:opacity-95 transition-opacity">
          <img
            src="/Satrinao.png"
            alt="Satriano Atelier"
            className="h-8 w-auto object-contain"
          />
          <span className="text-xs text-[#8DA0C4] border-l border-[#132A52] pl-3">
            B2B Manufacturing Portal
          </span>
        </Link>
        <nav className="flex flex-wrap justify-center gap-6 text-xs uppercase tracking-wider text-[#8DA0C4]">
          {FOOTER_NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="hover:text-[#E8ECF3] transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="text-xs text-[#8DA0C4]">
          © {new Date().getFullYear()} Satriano Atelier. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
