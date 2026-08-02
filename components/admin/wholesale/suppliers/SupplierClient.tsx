"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { SuppliersTable } from "./SuppliersTable";
import { AddSupplierModal, SupplierData } from "./AddSupplierModal";
import { EditSupplierModal, SupplierRecord } from "./EditSupplierModal";
import { SupplierDetailModal } from "./SupplierDetailModal";
import { AddWholesaleProductModal, SupplierOption, CategoryOption } from "../inventory/AddWholesaleProductModal";

export function SupplierClient() {
  const [suppliers, setSuppliers] = useState<SupplierRecord[]>([
    {
      id: "sup-1",
      firmName: "ABC Textile Co.",
      contactPerson: "John Doe",
      email: "john@abctextile.com",
      phone: "+90 212 555 1234",
      address: "Sultanbeyli, Istanbul",
      website: "https://www.abctextile.com",
      notes: "High quality wool & cotton supplier. 10 day lead time.",
      status: "ACTIVE",
      productsSuppliedCount: 8,
      totalStockUnits: 127,
      activeOffersCount: 3,
      createdAt: "Aug 1, 2026",
    },
    {
      id: "sup-2",
      firmName: "XYZ Fabrics",
      contactPerson: "Maria Garcia",
      email: "maria@xyzfabrics.com",
      phone: "+90 212 444 9876",
      address: "Zeytinburnu, Istanbul",
      website: "https://www.xyzfabrics.com",
      notes: "Pending verification documents for ISO standards.",
      status: "PENDING_VERIFICATION",
      productsSuppliedCount: 4,
      totalStockUnits: 45,
      activeOffersCount: 1,
      createdAt: "Aug 2, 2026",
    },
    {
      id: "sup-3",
      firmName: "Premium Knit Ltd.",
      contactPerson: "Ahmed Hassan",
      email: "ahmed@premiumknit.com",
      phone: "+90 224 333 5544",
      address: "Bursa Industrial Zone",
      website: "https://www.premiumknit.com",
      notes: "Knitwear & Polo shirt specialist. MOQ 10 packs.",
      status: "ACTIVE",
      productsSuppliedCount: 12,
      totalStockUnits: 210,
      activeOffersCount: 5,
      createdAt: "Jul 28, 2026",
    },
  ]);

  const categoriesOptions: CategoryOption[] = [
    { id: "cat-tops", name: "Tops" },
    { id: "cat-bottoms", name: "Bottoms" },
    { id: "cat-outerwear", name: "Outerwear" },
    { id: "cat-formal", name: "Formal Wear" },
  ];

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "PENDING">("ALL");

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<SupplierRecord | null>(null);
  const [viewingSupplier, setViewingSupplier] = useState<SupplierRecord | null>(null);
  const [addProductSupplierId, setAddProductSupplierId] = useState<string | null>(null);

  // Toast State
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((sup) => {
      const matchesSearch =
        sup.firmName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sup.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sup.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && sup.status === "ACTIVE") ||
        (statusFilter === "PENDING" && sup.status === "PENDING_VERIFICATION");

      return matchesSearch && matchesStatus;
    });
  }, [suppliers, searchQuery, statusFilter]);

  const handleCreateSupplier = (data: SupplierData) => {
    const newRecord: SupplierRecord = {
      id: `sup-${Date.now()}`,
      ...data,
      status: "ACTIVE",
      productsSuppliedCount: 0,
      totalStockUnits: 0,
      activeOffersCount: 0,
      createdAt: "Just now",
    };
    setSuppliers((prev) => [newRecord, ...prev]);
    showToast(`Created supplier ${data.firmName}`, "success");
  };

  const handleSaveSupplier = (updated: SupplierRecord) => {
    setSuppliers((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    showToast(`Updated supplier ${updated.firmName}`, "success");
  };

  const handleVerifySupplier = (id: string) => {
    setSuppliers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "ACTIVE" } : s))
    );
    showToast(`Verified and activated supplier`, "success");
  };

  const handleToggleStatus = (id: string, newStatus: SupplierRecord["status"]) => {
    setSuppliers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
    );
    showToast(`Updated supplier status to ${newStatus}`, "success");
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] font-sans antialiased text-[#111318] p-4 md:p-6 lg:p-8 space-y-6 relative">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-md shadow-xl font-bold text-xs flex items-center gap-2 border transition-all animate-bounce ${
            toast.type === "success"
              ? "bg-[#ECFDF3] border-[#5DCAA5] text-[#067647]"
              : "bg-[#FEE4E2] border-[#F8B4B4] text-[#C5221F]"
          }`}
        >
          <span className="material-symbols-outlined text-base">
            {toast.type === "success" ? "check_circle" : "error"}
          </span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#EAECF0] pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#111318] uppercase tracking-wide">
            SUPPLIER MANAGEMENT
          </h1>
          <p className="text-xs text-[#6B7280] mt-1">
            Manage wholesale manufacturing partners, review applications, and verify new suppliers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="h-10 px-4 bg-[#2E5AAC] hover:bg-[#1E3A8A] text-white text-xs font-bold uppercase tracking-wider rounded-md transition-colors inline-flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">add</span>
            + ADD NEW SUPPLIER
          </button>
          <Link
            href="/admin/wholesale"
            className="h-10 px-4 bg-white border border-[#D0D5DD] text-[#344054] hover:bg-[#F9FAFB] text-xs font-bold uppercase tracking-wider rounded-md transition-colors inline-flex items-center gap-2"
          >
            Back to Wholesale Dashboard
          </Link>
        </div>
      </div>

      {/* Controls Bar: Search & Filter Tabs */}
      <div className="bg-white border border-[#EAECF0] p-4 rounded-md flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#64748B] text-lg">
            search
          </span>
          <input
            type="text"
            placeholder="Search suppliers by name, contact, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#F8FAFC] border border-[#D0D5DD] rounded-md text-xs text-[#111318] focus:border-[#2E5AAC] focus:outline-none"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-[#6B7280] font-bold uppercase mr-1">Filter:</span>
          {(["ALL", "ACTIVE", "PENDING"] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-none font-bold uppercase transition-colors cursor-pointer border ${
                statusFilter === st
                  ? "bg-[#2E5AAC] text-white border-[#2E5AAC]"
                  : "bg-white text-[#344054] border-[#D0D5DD] hover:bg-[#F9FAFB]"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-[#EAECF0] rounded-md p-6">
        <SuppliersTable
          suppliers={filteredSuppliers}
          onEdit={(sup) => setEditingSupplier(sup)}
          onView={(sup) => setViewingSupplier(sup)}
          onVerify={handleVerifySupplier}
          onToggleStatus={handleToggleStatus}
        />
      </div>

      {/* Add Supplier Modal */}
      <AddSupplierModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onCreate={handleCreateSupplier}
      />

      {/* Edit Supplier Modal */}
      <EditSupplierModal
        isOpen={!!editingSupplier}
        supplier={editingSupplier}
        onClose={() => setEditingSupplier(null)}
        onSave={handleSaveSupplier}
      />

      {/* Supplier Detail Modal */}
      <SupplierDetailModal
        isOpen={!!viewingSupplier}
        supplier={viewingSupplier}
        onClose={() => setViewingSupplier(null)}
        onEdit={(sup) => {
          setViewingSupplier(null);
          setEditingSupplier(sup);
        }}
        onToggleStatus={handleToggleStatus}
        onAddProduct={(supId) => {
          setViewingSupplier(null);
          setAddProductSupplierId(supId);
        }}
      />

      {/* Add Wholesale Product Modal (prefilled supplierId) */}
      <AddWholesaleProductModal
        isOpen={!!addProductSupplierId}
        prefilledSupplierId={addProductSupplierId || undefined}
        suppliers={suppliers.map((s) => ({ id: s.id, firmName: s.firmName, status: s.status }))}
        categories={categoriesOptions}
        onClose={() => setAddProductSupplierId(null)}
        onSuccess={(newProd) => {
          showToast(`Created wholesale product ${newProd.name || newProd.sku}`, "success");
        }}
        showToast={showToast}
      />
    </div>
  );
}
