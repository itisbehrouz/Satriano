import { notFound } from "next/navigation";
import { TransactionalHeader } from "@/components/layout/TransactionalHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { prisma } from "@/lib/prisma";
import { formatCents } from "@/lib/formatCurrency";

// Render proforma review page on demand for every request
export const dynamic = "force-dynamic";

interface ProformaPageProps {
  params: Promise<{ orderId: string }>;
}

export default async function ProformaPage({ params }: ProformaPageProps) {
  const { orderId } = await params;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      company: true,
      lines: { include: { fabric: true } },
      proforma: true,
    },
  });

  if (!order) {
    notFound();
  }

  const totalUnits = order.lines.reduce((sum, line) => sum + line.quantity, 0);
  const refNo = order.proforma?.refNo || `ORD-${order.id.slice(-8).toUpperCase()}`;
  const primaryFabric = order.lines[0]?.fabric;
  const isPendingReview = order.status === "PENDING_REVIEW" || !order.finalPriceCents;

  const unitPriceToDisplay = order.finalPriceCents || primaryFabric?.priceMinCents || 0;
  const subtotalCents = totalUnits * unitPriceToDisplay;

  return (
    <>
      <TransactionalHeader />
      <main className="flex-grow w-full py-12 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto bg-[var(--color-bg)] text-[var(--color-text-primary)] transition-colors">
        <div className="mb-8 max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">
            {isPendingReview ? "Order Feasibility Review" : "Proforma Review"}
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {isPendingReview
              ? "Your order specifications are currently under manual review by our atelier production team."
              : "Please review your finalized order details before authorizing production."}
          </p>
        </div>

        {isPendingReview && (
          <div className="max-w-4xl mx-auto mb-8 bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 rounded-none p-6 text-[var(--color-text-primary)]">
            <div className="flex items-center gap-3 mb-2">
              <span className="material-symbols-outlined text-2xl text-[var(--color-accent)]">hourglass_top</span>
              <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Feasibility Review In Progress</h2>
            </div>
            <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
              We have received your custom manufacturing order for <strong>{totalUnits} units</strong>. Our master tailors are inspecting material availability and target budget parameters ({order.customerTargetPriceCents ? `$${(order.customerTargetPriceCents / 100).toFixed(2)}/unit` : "Estimated range"}). You will receive a notification at <strong>{order.company.email}</strong> once your final proforma invoice is ready.
            </p>
          </div>
        )}

        <article className="max-w-4xl mx-auto bg-[var(--color-surface)] border border-[var(--color-border)] rounded-none shadow-sm relative overflow-hidden transition-colors">
          <div className="absolute top-0 left-0 w-full h-[4px] bg-[var(--color-gold)]" />
          <div className="p-8 md:p-12">
            <div className="flex flex-col md:flex-row justify-between border-b border-[var(--color-border)] pb-8 mb-8 gap-8">
              <div>
                <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-1">
                  {isPendingReview ? "Manufacturing Spec Summary" : "Proforma Invoice"}
                </h2>
                <p className="text-xs text-[var(--color-text-secondary)] uppercase tracking-widest font-mono">
                  Ref: {refNo}
                </p>
              </div>
              <div className="text-left md:text-right">
                <p className="text-sm text-[var(--color-text-secondary)]">
                  <span className="font-semibold text-[var(--color-text-primary)]">
                    Date:
                  </span>{" "}
                  {order.createdAt.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  <span className="font-semibold text-[var(--color-text-primary)]">
                    Client:
                  </span>{" "}
                  {order.company.name}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-12">
              <div className="lg:col-span-7 flex flex-col gap-6">
                <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-4 border-b border-[var(--color-border)] pb-2 inline-block">
                  Product Specification
                </h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                  <div>
                    <dt className="text-xs text-[var(--color-text-secondary)] uppercase tracking-widest mb-1">
                      Target Budget
                    </dt>
                    <dd className="text-sm text-[var(--color-text-primary)] font-medium">
                      {order.customerTargetPriceCents
                        ? `${formatCents(order.customerTargetPriceCents)} / unit`
                        : "Guidance Range Only"}
                    </dd>
                  </div>
                  {primaryFabric && (
                    <div>
                      <dt className="text-xs text-[var(--color-text-secondary)] uppercase tracking-widest mb-1">
                        Fabric Selection
                      </dt>
                      <dd className="text-sm text-[var(--color-text-primary)] font-medium">
                        {primaryFabric.name}
                      </dd>
                    </div>
                  )}
                  {order.lines[0]?.selectedFit && (
                    <div>
                      <dt className="text-xs text-[var(--color-text-secondary)] uppercase tracking-widest mb-1">
                        Garment Fit
                      </dt>
                      <dd className="text-sm text-[var(--color-accent)] font-semibold">
                        {order.lines[0].selectedFit}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>

              {primaryFabric?.imageUrl && (
                <div className="lg:col-span-5">
                  <div className="bg-[var(--color-bg)] border border-[var(--color-border)] p-2">
                    <div className="aspect-[4/5] w-full relative bg-[var(--color-bg)] overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        className="absolute inset-0 w-full h-full object-cover"
                        alt={`${primaryFabric.name} fabric swatch`}
                        src={primaryFabric.imageUrl}
                      />
                    </div>
                    <p className="text-xs text-[var(--color-text-secondary)] text-center mt-3 uppercase tracking-widest font-mono">
                      Fabric Swatch Preview
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="mb-12">
              <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-4">
                Size &amp; Quantity Ledger
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse border border-[var(--color-border)]">
                  <thead>
                    <tr className="bg-[var(--color-bg)] text-xs text-[var(--color-text-primary)] uppercase tracking-widest">
                      <th className="p-4 border-b border-[var(--color-border)] font-medium">Size</th>
                      <th className="p-4 border-b border-[var(--color-border)] font-medium text-right">
                        Unit Price
                      </th>
                      <th className="p-4 border-b border-[var(--color-border)] font-medium text-right">
                        Quantity
                      </th>
                      <th className="p-4 border-b border-[var(--color-border)] font-medium text-right">
                        Est. Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-xs text-[var(--color-text-primary)]">
                    {order.lines.map((line, index) => (
                      <tr
                        key={line.id}
                        className={`border-b border-[var(--color-border)] ${
                          index % 2 === 0 ? "bg-[var(--color-surface)]" : "bg-[var(--color-bg)]"
                        }`}
                      >
                        <td className="p-4 font-bold">{line.size}</td>
                        <td className="p-4 text-right">
                          {isPendingReview ? "Pending Review" : formatCents(unitPriceToDisplay)}
                        </td>
                        <td className="p-4 text-right font-mono font-bold">{line.quantity}</td>
                        <td className="p-4 text-right font-mono">
                          {isPendingReview
                            ? "Pending Review"
                            : formatCents(line.quantity * unitPriceToDisplay)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-t border-[var(--color-border)] pt-6">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-[var(--color-gold)] bg-[var(--color-gold)]/10 py-2 px-4 border border-[var(--color-gold)]/30 w-max">
                    <span className="material-symbols-outlined text-[18px]">schedule</span>
                    <span className="text-xs uppercase tracking-widest font-semibold font-mono">
                      Status: {order.status}
                    </span>
                  </div>
                  {order.proforma?.pdfUrl && (
                    <a
                      href={order.proforma.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-xs font-semibold uppercase tracking-wider rounded-none transition-colors shadow-sm w-max"
                    >
                      <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
                      <span>Download Official Proforma PDF</span>
                    </a>
                  )}
                </div>
              <div className="w-full md:w-1/2 lg:w-1/3">
                <div className="flex justify-between py-2 border-b border-[var(--color-border)] text-xs text-[var(--color-text-secondary)]">
                  <span>
                    Total Units
                  </span>
                  <span className="font-bold text-[var(--color-text-primary)] font-mono">
                    {totalUnits}
                  </span>
                </div>

                <div className="flex justify-between py-4 mt-2 text-sm text-[var(--color-text-primary)]">
                  <span className="font-bold uppercase">
                    Final Total
                  </span>
                  <span className="font-bold text-lg text-[var(--color-accent)] font-mono">
                    {isPendingReview ? "Pending Review" : formatCents(order.totalCents)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
