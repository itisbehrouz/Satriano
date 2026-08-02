"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";

interface GlobalCommandPaletteProps {
  isOpen?: boolean;
  onClose?: () => void;
  onOpen?: () => void;
  onOpenChange?: (open: boolean) => void;
}

interface CatalogProductItem {
  id: string;
  name: string;
  slug: string;
  categoryName: string;
  subcategoryName: string;
}

interface OrderSummaryItem {
  id: string;
  companyName: string;
  status: string;
  createdAt: string;
}

export function GlobalCommandPalette({
  isOpen: externalIsOpen,
  onClose: externalOnClose,
  onOpen: externalOnOpen,
  onOpenChange: externalOnOpenChange,
}: GlobalCommandPaletteProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [products, setProducts] = useState<CatalogProductItem[]>([]);
  const [orders, setOrders] = useState<OrderSummaryItem[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const router = useRouter();

  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = (val: boolean) => {
    if (externalOnOpenChange) {
      externalOnOpenChange(val);
    }
    if (val && externalOnOpen) {
      externalOnOpen();
    } else if (!val && externalOnClose) {
      externalOnClose();
    }
    setInternalIsOpen(val);
  };

  // Listen for global Cmd+K / Ctrl+K / Alt+K and Escape keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isK = e.code === "KeyK" || e.key.toLowerCase() === "k";
      const isModifierPressed = e.metaKey || e.ctrlKey || e.altKey;

      // Toggle palette on Cmd+K, Ctrl+K, or Alt+K (Option+K on Mac)
      if (isModifierPressed && isK) {
        e.preventDefault();
        e.stopPropagation();
        setIsOpen(!isOpen);
        return;
      }

      // Close palette on Escape key when open
      if ((e.code === "Escape" || e.key === "Escape") && isOpen) {
        e.preventDefault();
        e.stopPropagation();
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [isOpen, externalOnOpen, externalOnClose, externalOnOpenChange]);

  // Fetch real catalog & orders data when command palette is opened
  useEffect(() => {
    if (isOpen) {
      let isMounted = true;
      setLoadingData(true);

      const fetchData = async () => {
        try {
          // Fetch catalog and admin orders
          let [catalogRes, ordersRes] = await Promise.all([
            fetch("/api/admin/catalog").catch(() => null),
            fetch("/api/admin/orders").catch(() => null),
          ]);

          // Fallback for customer portal session if admin endpoint is unauthorized
          if (!ordersRes || !ordersRes.ok) {
            ordersRes = await fetch("/api/portal/orders").catch(() => null);
          }

          if (catalogRes && catalogRes.ok) {
            const catData = await catalogRes.json();
            if (catData.categories && isMounted) {
              const items: CatalogProductItem[] = [];
              for (const cat of catData.categories) {
                for (const sub of cat.subcategories || []) {
                  for (const p of sub.products || []) {
                    items.push({
                      id: p.id,
                      name: p.name,
                      slug: p.slug,
                      categoryName: cat.name,
                      subcategoryName: sub.name,
                    });
                  }
                }
              }
              setProducts(items);
            }
          }

          if (ordersRes && ordersRes.ok) {
            const orderData = await ordersRes.json();
            if (orderData.orders && isMounted) {
              const items: OrderSummaryItem[] = orderData.orders.map((o: any) => ({
                id: o.id,
                companyName: o.company?.name || o.customerName || "B2B Order",
                status: o.status,
                createdAt: o.createdAt || o.dateSubmitted,
              }));
              setOrders(items);
            }
          }
        } catch (err) {
          console.error("Failed to load command palette search index:", err);
        } finally {
          if (isMounted) setLoadingData(false);
        }
      };

      fetchData();
      return () => {
        isMounted = false;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const navigateTo = (path: string) => {
    setIsOpen(false);
    router.push(path);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 font-sans">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fadeIn"
        onClick={() => setIsOpen(false)}
      />

      {/* Command Palette Dialog Window */}
      <div className="relative w-full max-w-xl bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-2xl overflow-hidden z-50 animate-scaleUp text-[var(--color-text-primary)]">
        <Command label="Global Command Palette" className="w-full">
          {/* Input Header */}
          <div className="flex items-center px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
            <span className="material-symbols-outlined text-[var(--color-text-secondary)] text-lg mr-2.5">
              search
            </span>
            <Command.Input
              autoFocus
              placeholder="Search products, orders, companies, or commands... (ESC to exit)"
              className="w-full bg-transparent text-xs text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] focus:outline-none"
            />
            {loadingData && (
              <span className="w-3.5 h-3.5 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin mr-2 shrink-0" />
            )}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-1.5 py-0.5 bg-[var(--color-bg)] hover:bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-[10px] font-mono text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] shrink-0 ml-2 cursor-pointer transition-colors"
              title="Close search (ESC)"
            >
              ESC
            </button>
          </div>

          {/* Results Command List */}
          <Command.List className="max-h-80 overflow-y-auto p-2 divide-y divide-[var(--color-border)]">
            <Command.Empty className="p-6 text-center text-xs text-[var(--color-text-secondary)]">
              No matching products, orders, or commands found.
            </Command.Empty>

            {/* Dynamic Group 1: Live Catalog Products */}
            {products.length > 0 && (
              <Command.Group heading="Catalog Products & Specs" className="py-1">
                {products.map((p) => (
                  <Command.Item
                    key={p.id}
                    onSelect={() => navigateTo("/konfigurator")}
                    className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-accent)]/10 hover:text-[var(--color-accent)] cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-base text-[var(--color-text-secondary)]">
                        checkroom
                      </span>
                      <div>
                        <span className="block font-bold">{p.name}</span>
                        <span className="text-[10px] text-[var(--color-text-secondary)] font-mono font-normal block">
                          {p.categoryName} &rarr; {p.subcategoryName}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] bg-[var(--color-bg)] text-[var(--color-text-secondary)] px-2 py-0.5 rounded border border-[var(--color-border)] font-mono">
                      View Spec &rarr;
                    </span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {/* Dynamic Group 2: Production Orders & B2B Clients */}
            {orders.length > 0 && (
              <Command.Group heading="Production Orders & B2B Clients" className="py-1">
                {orders.map((o) => (
                  <Command.Item
                    key={o.id}
                    onSelect={() => navigateTo(o.id.startsWith("PRO-") ? "/portal/orders" : "/admin")}
                    className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-accent)]/10 hover:text-[var(--color-accent)] cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-base text-[var(--color-accent)]">
                        receipt
                      </span>
                      <div>
                        <span className="block font-bold">{o.companyName}</span>
                        <span className="text-[10px] text-[var(--color-text-secondary)] font-mono font-normal block">
                          Order ID: {o.id.length > 12 ? o.id.slice(-8).toUpperCase() : o.id}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] bg-[var(--color-accent)]/10 text-[var(--color-accent)] px-2 py-0.5 rounded font-mono font-semibold">
                      {o.status}
                    </span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {/* Group 3: Portal Navigation & Shortcuts */}
            <Command.Group heading="Client Portal Navigation" className="py-1">
              <Command.Item
                onSelect={() => navigateTo("/konfigurator")}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-accent)]/10 hover:text-[var(--color-accent)] cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-base text-[var(--color-accent)]">
                    checkroom
                  </span>
                  <span>Garment Customization Catalog</span>
                </div>
                <span className="text-[10px] text-[var(--color-text-secondary)] font-mono font-normal">/konfigurator</span>
              </Command.Item>

              <Command.Item
                onSelect={() => navigateTo("/portal/orders")}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-accent)]/10 hover:text-[var(--color-accent)] cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-base text-[var(--color-accent)]">
                    receipt_long
                  </span>
                  <span>Orders &amp; Production History</span>
                </div>
                <span className="text-[10px] text-[var(--color-text-secondary)] font-mono font-normal">/portal/orders</span>
              </Command.Item>

              <Command.Item
                onSelect={() => navigateTo("/portal/account?tab=company")}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-accent)]/10 hover:text-[var(--color-accent)] cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-base text-[var(--color-accent)]">
                    manage_accounts
                  </span>
                  <span>Company Account &amp; Settings</span>
                </div>
                <span className="text-[10px] text-[var(--color-text-secondary)] font-mono font-normal">/portal/account</span>
              </Command.Item>

              <Command.Item
                onSelect={() => navigateTo("/portal/account?tab=support")}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-accent)]/10 hover:text-[var(--color-accent)] cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-base text-[var(--color-accent)]">
                    help_center
                  </span>
                  <span>Support &amp; Technical Assistance</span>
                </div>
                <span className="text-[10px] text-[var(--color-text-secondary)] font-mono font-normal">/portal/support</span>
              </Command.Item>

              <Command.Item
                onSelect={() => navigateTo("/wholesale")}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-accent)]/10 hover:text-[var(--color-accent)] cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-base text-[var(--color-accent)]">
                    storefront
                  </span>
                  <span>Wholesale Menswear Collection</span>
                </div>
                <span className="text-[10px] text-[var(--color-text-secondary)] font-mono font-normal">/wholesale</span>
              </Command.Item>
            </Command.Group>
          </Command.List>

          {/* Footer Bar */}
          <div className="p-3 bg-[var(--color-bg)] border-t border-[var(--color-border)] flex items-center justify-between text-[11px] text-[var(--color-text-secondary)]">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded font-mono text-[10px]">↑↓</kbd> Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded font-mono text-[10px]">↵</kbd> Select
              </span>
            </div>
            <span className="font-mono text-[10px]">Satriano Atelier</span>
          </div>
        </Command>
      </div>
    </div>
  );
}
