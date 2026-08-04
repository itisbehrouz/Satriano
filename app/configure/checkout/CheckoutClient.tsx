"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getM2OCart, clearM2OCart, type M2OCartItem, removeFromM2OCart } from "@/lib/m2oCart";
import { GuestLoginModal } from "@/components/configure/GuestLoginModal";
import { useCustomerSession } from "@/hooks/useCustomerSession";
import { formatCents } from "@/lib/formatCurrency";
import Image from "next/image";

export function CheckoutClient() {
  const router = useRouter();
  const { session } = useCustomerSession();
  const isLoggedIn = session?.authenticated === true;

  const [cartItems, setCartItems] = useState<M2OCartItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [customerTargetPrice, setCustomerTargetPrice] = useState("");
  
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);

  useEffect(() => {
    setCartItems(getM2OCart());
    setLoaded(true);
    if (session?.companyName) setCompanyName(session.companyName);
    if (session?.email) setCompanyEmail(session.email);
  }, [session]);

  const handleRemove = (id: string) => {
    removeFromM2OCart(id);
    setCartItems(getM2OCart());
  };

  async function handleSendMagicLink(email: string) {
    const res = await fetch("/api/portal/magic-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || "Failed to send magic link email.");
    }
    router.push(`/configure/guest-confirmation?email=${encodeURIComponent(email)}`);
  }

  async function handleGuestOrderSubmit(email: string) {
    setCompanyEmail(email);
    if (!companyName) {
      setCompanyName(email.split("@")[0].toUpperCase());
    }
    await processOrder(email, companyName || email.split("@")[0].toUpperCase(), true);
  }

  async function handleSubmit() {
    if (!isLoggedIn && (!companyName.trim() || !companyEmail.trim())) {
      setIsGuestModalOpen(true);
      return;
    }
    if (!companyName.trim() || !companyEmail.trim()) {
      setSubmitError("Company name and corporate email are required to submit order.");
      return;
    }
    await processOrder(companyEmail, companyName, false);
  }

  async function processOrder(email: string, name: string, isGuest: boolean) {
    setSubmitError(null);
    setSubmitting(true);
    try {
      const targetPriceVal = parseFloat(customerTargetPrice);
      const targetPriceCents =
        !isNaN(targetPriceVal) && targetPriceVal > 0
          ? Math.round(targetPriceVal * 100)
          : undefined;

      const payloadItems = cartItems.map((item) => ({
        fabricId: item.fabricId,
        productId: item.productId,
        fitId: item.fitId,
        sizeQuantities: item.sizeQuantities,
        logoUrl: item.logoUrl,
        logoPlacement: item.logoPlacement,
      }));

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: name,
          companyEmail: email,
          customerTargetPriceCents: targetPriceCents,
          items: payloadItems,
        }),
      });

      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error ?? "Failed to submit order.");
      }

      clearM2OCart();

      if (isGuest) {
        // Trigger magic link email for guest verification
        fetch("/api/portal/magic-link", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }).catch(() => {});
        router.push(`/configure/guest-confirmation?email=${encodeURIComponent(email)}`);
      } else {
        router.push(`/configure/success?orderId=${json.orderId}`);
      }
    } catch (err: any) {
      setSubmitError(err.message || "Network connection error.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!loaded) return null;

  if (cartItems.length === 0) {
    return (
      <main className="flex-grow w-full max-w-container-max mx-auto px-4 md:px-8 py-20 text-center font-sans">
        <span className="material-symbols-outlined text-4xl text-[var(--color-text-secondary)] mb-4">
          shopping_cart
        </span>
        <h1 className="text-2xl font-bold mb-4">Your Order Spec is Empty</h1>
        <p className="text-[var(--color-text-secondary)] mb-8">
          Browse our catalog to configure made-to-order garments.
        </p>
        <button
          onClick={() => router.push("/categories")}
          className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white px-6 py-3 font-bold uppercase tracking-wider text-sm transition-colors"
        >
          View Catalog
        </button>
      </main>
    );
  }

  return (
    <main className="flex-grow w-full max-w-container-max mx-auto px-4 md:px-8 py-10 bg-[var(--color-bg)] text-[var(--color-text-primary)] font-sans">
      <div className="mb-8 bg-[var(--color-surface)] border border-[var(--color-border)] p-6 md:p-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Order Specification Review</h1>
        <p className="text-[var(--color-text-secondary)] text-sm">
          Review your configured items below. Once submitted, our Atelier Engineering Desk will evaluate feasibility and issue a proforma invoice.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 flex flex-col gap-6">
          {cartItems.map((item, index) => (
            <div key={item.id} className="bg-[var(--color-surface)] border border-[var(--color-border)] p-6">
              <div className="flex justify-between items-start mb-4 border-b border-[var(--color-border)] pb-4">
                <div>
                  <h3 className="font-bold text-lg">{item.productName}</h3>
                  <p className="text-[var(--color-text-secondary)] text-sm">{item.fabricName}</p>
                </div>
                <button
                  onClick={() => handleRemove(item.id)}
                  className="text-red-500 hover:text-red-600 text-xs font-bold uppercase tracking-wider flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-base">delete</span>
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-4">
                <div>
                  <span className="block text-[var(--color-text-secondary)] text-xs uppercase mb-1">Fit</span>
                  <span className="font-semibold">{item.fitName || "Standard"}</span>
                </div>
                <div>
                  <span className="block text-[var(--color-text-secondary)] text-xs uppercase mb-1">Total Units</span>
                  <span className="font-semibold">{item.totalUnits} pcs</span>
                </div>
                {item.logoUrl && (
                  <div>
                    <span className="block text-[var(--color-text-secondary)] text-xs uppercase mb-1">Branding</span>
                    <span className="font-semibold">{item.logoPlacement === "LEFT_CHEST" ? "Left Chest" : "Right Sleeve"}</span>
                  </div>
                )}
              </div>

              {item.logoUrl && (
                <div className="mt-4 pt-4 border-t border-[var(--color-border)] flex items-center gap-4">
                  <div className="w-12 h-12 relative bg-[var(--color-bg)] border border-[var(--color-border)]">
                    <Image src={item.logoUrl} alt="Logo" fill className="object-contain p-1" />
                  </div>
                  <span className="text-xs text-[var(--color-text-secondary)]">Vector Logo Attached</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="lg:col-span-4">
          <section className="bg-[var(--color-surface)] border border-[var(--color-border)] p-6 sticky top-24">
            <h2 className="text-base font-bold uppercase tracking-wider mb-6 flex items-center gap-2">
              <span className="w-6 h-6 bg-[var(--color-accent)] text-white text-xs font-mono font-bold flex items-center justify-center">
                ✓
              </span>
              Corporate Info & Submission
            </h2>

            {!isLoggedIn && (
              <div className="mb-6 p-4 bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 text-xs">
                <strong className="block font-bold mb-1">Have a partner account?</strong>
                <button
                  type="button"
                  onClick={() => router.push("/portal")}
                  className="text-[var(--color-accent)] font-bold uppercase tracking-wider hover:underline"
                >
                  Log in here
                </button>
              </div>
            )}

            <div className="space-y-5 mb-6">
              <div>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Retail Apparel Group"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2.5 text-sm focus:border-[var(--color-accent)] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider">
                  Corporate Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. procurement@acme.com"
                  value={companyEmail}
                  onChange={(e) => setCompanyEmail(e.target.value)}
                  className="w-full border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2.5 text-sm focus:border-[var(--color-accent)] focus:outline-none"
                />
              </div>
              <div className="p-4 bg-[var(--color-bg)] border border-[var(--color-border)]">
                <label className="block text-xs font-semibold mb-1 uppercase tracking-wider">
                  Total Order Target Budget ($ USD) <span className="text-[var(--color-text-secondary)] font-normal lowercase">(optional)</span>
                </label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  placeholder="e.g. 5000"
                  value={customerTargetPrice}
                  onChange={(e) => setCustomerTargetPrice(e.target.value)}
                  className="w-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm focus:border-[var(--color-accent)] focus:outline-none"
                />
              </div>
            </div>

            {submitError && (
              <p className="text-xs text-red-500 bg-red-500/10 p-3 mb-4 border border-red-500/20">
                {submitError}
              </p>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-xs uppercase font-bold tracking-wider py-4 px-6 transition-all disabled:opacity-50 flex justify-center"
            >
              {submitting ? "Submitting..." : "Submit Order Spec →"}
            </button>
            <p className="text-center text-[10px] text-[var(--color-text-secondary)] mt-3">
              By submitting, you request a feasibility review. No charges are applied until proforma is approved.
            </p>
          </section>
        </div>
      </div>

      <GuestLoginModal
        isOpen={isGuestModalOpen}
        onClose={() => setIsGuestModalOpen(false)}
        onSendMagicLink={handleSendMagicLink}
        onSubmitGuestOrder={handleGuestOrderSubmit}
        initialEmail={companyEmail}
      />
    </main>
  );
}
