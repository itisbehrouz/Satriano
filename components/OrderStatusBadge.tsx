import type { OrderStatus } from "@/app/generated/prisma/enums";

const STATUS_CONFIG: Record<OrderStatus, { label: string; className: string }> = {
  DRAFT: {
    label: "Draft",
    className: "bg-[#E5E7EB] text-[#5B6B85] border border-[#D1D5DB]",
  },
  PENDING_REVIEW: {
    label: "Pending Review",
    className: "bg-[#E6F1FB] text-[#185FA5] border border-[#B3D6F6]",
  },
  PROFORMA_SENT: {
    label: "Proforma Sent",
    className: "bg-[#FAEEDA] text-[#854F0B] border border-[#F5D8A4]",
  },
  APPROVED: {
    label: "Approved",
    className: "bg-[#E1F5EE] text-[#0F6E56] border border-[#A6E5CE]",
  },
  PAID: {
    label: "Paid",
    className: "bg-[#E1F5EE] text-[#0F6E56] border border-[#A6E5CE]",
  },
  IN_PRODUCTION: {
    label: "In Production",
    className: "bg-[#E6F1FB] text-[#185FA5] border border-[#B3D6F6]",
  },
  SHIPPED: {
    label: "Shipped",
    className: "bg-[#E1F5EE] text-[#0F6E56] border border-[#A6E5CE]",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-[#FCEBEB] text-[#A32D2D] border border-[#F7C5C5]",
  },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const config = STATUS_CONFIG[status] || {
    label: status,
    className: "bg-[#F5F7FA] text-[#1A2233] border border-[#D1D5DB]",
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium tracking-wide ${config.className}`}
    >
      {config.label}
    </span>
  );
}
