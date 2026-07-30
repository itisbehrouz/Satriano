import Link from "next/link";

export function TransactionalHeader() {
  return (
    <header className="bg-surface-dim py-6 px-margin-mobile md:px-margin-desktop w-full border-b border-gold">
      <div className="max-w-container-max mx-auto flex justify-between items-center">
        <Link
          href="/"
          className="font-headline-lg text-on-surface-dim tracking-tight"
          style={{ fontSize: "32px", lineHeight: "40px" }}
        >
          SATRIANO
        </Link>
        <div className="flex items-center gap-2 text-on-surface-dim">
          <span className="material-symbols-outlined text-[20px]">lock</span>
          <span className="font-label-sm text-label-sm uppercase tracking-widest">
            Secure Checkout
          </span>
        </div>
      </div>
    </header>
  );
}
