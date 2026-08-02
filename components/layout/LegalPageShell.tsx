import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export interface LegalSection {
  id: string;
  title: string;
  content: React.ReactNode;
}

export interface LegalPageShellProps {
  title: string;
  categoryBadge: string;
  effectiveDate: string;
  activeSlug: "terms" | "privacy" | "supply-terms" | "security" | "cookies" | "ethics";
  sections: LegalSection[];
}

const LEGAL_DOCUMENTS = [
  { slug: "terms", label: "Terms of Service", href: "/legal/terms" },
  { slug: "privacy", label: "Privacy Policy", href: "/legal/privacy" },
  { slug: "supply-terms", label: "Supply & Manufacturing Terms", href: "/legal/supply-terms" },
  { slug: "security", label: "Security & Data Protection", href: "/legal/security" },
  { slug: "cookies", label: "Cookie Policy", href: "/legal/cookies" },
];

export function LegalPageShell({
  title,
  categoryBadge,
  effectiveDate,
  activeSlug,
  sections,
}: LegalPageShellProps) {
  return (
    <>
      <SiteHeader />
      <main className="flex-grow bg-[var(--color-bg)] text-[var(--color-text-primary)] font-sans antialiased transition-colors">
        {/* Executive Hero Header */}
        <section className="w-full bg-[var(--color-bg)] text-[var(--color-text-primary)] py-12 lg:py-16 relative overflow-hidden transition-colors">
          <div className="max-w-[1440px] mx-auto px-6 lg:px-8 relative z-10">
            {/* Breadcrumb Navigation */}
            <nav className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)] mb-6">
              <Link href="/" className="hover:text-[var(--color-text-primary)] transition-colors">
                Home
              </Link>
              <span className="text-[var(--color-text-secondary)]">/</span>
              <span className="text-[var(--color-text-secondary)]">Legal &amp; Compliance</span>
              <span className="text-[var(--color-text-secondary)]">/</span>
              <span className="font-medium text-[var(--color-text-primary)]">{title}</span>
            </nav>

            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 text-[11px] font-semibold uppercase tracking-widest text-[var(--color-accent)] rounded-none">
                <span className="w-1.5 h-1.5 rounded-none bg-[var(--color-accent)]" />
                {categoryBadge}
              </div>

              <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-[var(--color-text-primary)] font-sans">
                {title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--color-text-secondary)] pt-1">
                <span>Effective Date: <strong className="text-[var(--color-text-primary)] font-medium">{effectiveDate}</strong></span>
                <span>•</span>
                <span>Jurisdiction: <strong className="text-[var(--color-text-primary)] font-medium">International B2B Commercial Law</strong></span>
                <span>•</span>
                <span className="px-2 py-0.5 bg-[var(--color-status-success-bg)] text-[var(--color-status-success)] border border-[var(--color-status-success)]/30 rounded-none font-mono">
                  GDPR Compliant
                </span>
              </div>
            </div>

            {/* Document Navigation Tabs */}
            <div className="mt-10 pt-6 border-t border-[var(--color-border)] flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {LEGAL_DOCUMENTS.map((doc) => {
                const isActive = doc.slug === activeSlug;
                return (
                  <Link
                    key={doc.slug}
                    href={doc.href}
                    className={`whitespace-nowrap px-4 py-2 rounded-none text-xs font-semibold uppercase tracking-wider transition-all ${
                      isActive
                        ? "bg-[var(--color-accent)] text-white border border-[var(--color-accent)]"
                        : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border border-[var(--color-border)]"
                    }`}
                  >
                    {doc.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Content Section with Sticky Sidebar */}
        <section className="w-full py-12 lg:py-16 px-6 lg:px-8 bg-[var(--color-bg)] transition-colors">
          <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left Column: Sticky Table of Contents & Contact Card */}
            <aside className="lg:col-span-4 space-y-6">
              <div className="sticky top-8 space-y-6">
                {/* Table of Contents Card */}
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-none p-6 shadow-sm">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)] mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">toc</span>
                    Document Index
                  </h3>
                  <nav className="space-y-2">
                    {sections.map((sec, idx) => (
                      <a
                        key={sec.id}
                        href={`#${sec.id}`}
                        className="block text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] hover:bg-[var(--color-bg)] px-3 py-2 rounded-none transition-colors font-medium border-l-2 border-transparent hover:border-[var(--color-accent)]"
                      >
                        <span className="text-[var(--color-text-secondary)] font-mono mr-2">{idx + 1}.</span>
                        {sec.title}
                      </a>
                    ))}
                  </nav>
                </div>

                {/* Compliance Officer Contact Card */}
                <div className="bg-[var(--color-surface)] text-[var(--color-text-primary)] border border-[var(--color-border)] rounded-none p-6 space-y-3">
                  <span className="material-symbols-outlined text-[var(--color-status-success)] text-2xl">verified_user</span>
                  <h4 className="text-sm font-bold text-[var(--color-text-primary)]">Legal &amp; Compliance Office</h4>
                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                    Have questions regarding custom B2B manufacturing terms, GDPR data rights, or proforma validity?
                  </p>
                  <a
                    href="mailto:compliance@satrianoatelier.com"
                    className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--color-accent)] hover:underline transition-colors pt-1"
                  >
                    <span>compliance@satrianoatelier.com</span>
                    <span>→</span>
                  </a>
                </div>
              </div>
            </aside>

            {/* Right Column: Main Document Body */}
            <div className="lg:col-span-8 space-y-8">
              {sections.map((sec) => (
                <article
                  key={sec.id}
                  id={sec.id}
                  className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-none p-8 lg:p-10 shadow-sm scroll-mt-8 space-y-4"
                >
                  <div className="flex items-center gap-3 border-b border-[var(--color-border)] pb-4">
                    <span className="w-8 h-8 rounded-none bg-[var(--color-accent)]/10 text-[var(--color-accent)] font-mono font-bold text-xs flex items-center justify-center border border-[var(--color-accent)]/20">
                      #
                    </span>
                    <h2 className="text-xl font-bold tracking-tight text-[var(--color-text-primary)]">
                      {sec.title}
                    </h2>
                  </div>
                  <div className="text-sm text-[var(--color-text-secondary)] leading-relaxed space-y-4">
                    {sec.content}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
