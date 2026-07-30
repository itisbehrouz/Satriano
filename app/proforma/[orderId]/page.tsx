import { notFound } from "next/navigation";
import { TransactionalHeader } from "@/components/layout/TransactionalHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { prisma } from "@/lib/prisma";
import { formatCents } from "@/lib/formatCurrency";

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
    },
  });

  if (!order) {
    notFound();
  }

  const totalUnits = order.lines.reduce((sum, line) => sum + line.quantity, 0);
  const subtotalCents = order.lines.reduce(
    (sum, line) => sum + line.quantity * line.unitPriceCents,
    0,
  );
  const refNo = `ORD-${order.id.slice(-8).toUpperCase()}`;
  const primaryFabric = order.lines[0]?.fabric;

  return (
    <>
      <TransactionalHeader />
      <main className="flex-grow w-full py-12 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        <div className="mb-8 max-w-4xl mx-auto">
          <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">
            Proforma Review
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Please review your order details before authorizing production.
          </p>
        </div>

        <article className="max-w-4xl mx-auto bg-surface-container-lowest border border-gold shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[4px] bg-gold" />
          <div className="p-8 md:p-12">
            <div className="flex flex-col md:flex-row justify-between border-b border-outline-variant pb-8 mb-8 gap-8">
              <div>
                <h2 className="font-headline-md text-headline-md text-on-surface mb-1">
                  Proforma Invoice
                </h2>
                <p className="font-label-sm text-label-sm text-outline uppercase tracking-widest">
                  Ref: {refNo}
                </p>
              </div>
              <div className="text-left md:text-right">
                <p className="font-body-md text-body-md text-on-surface-variant">
                  <span className="font-label-md text-label-md text-on-surface">
                    Date:
                  </span>{" "}
                  {order.createdAt.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  <span className="font-label-md text-label-md text-on-surface">
                    Client:
                  </span>{" "}
                  {order.company.name}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-12">
              <div className="lg:col-span-7 flex flex-col gap-6">
                <h3 className="font-headline-sm text-headline-sm text-on-surface mb-4 border-b border-outline-variant pb-2 inline-block">
                  Product Specification
                </h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                  <div>
                    <dt className="font-label-sm text-label-sm text-outline uppercase tracking-widest mb-1">
                      Garment Type
                    </dt>
                    <dd className="font-body-lg text-body-lg text-on-surface">
                      Bespoke Polo T-Shirt
                    </dd>
                  </div>
                  {primaryFabric && (
                    <div>
                      <dt className="font-label-sm text-label-sm text-outline uppercase tracking-widest mb-1">
                        Fabric Selection
                      </dt>
                      <dd className="font-body-lg text-body-lg text-on-surface">
                        {primaryFabric.name}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>

              {primaryFabric?.imageUrl && (
                <div className="lg:col-span-5">
                  <div className="bg-surface-container-low border border-outline-variant p-2">
                    <div className="aspect-[4/5] w-full relative bg-surface overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        className="absolute inset-0 w-full h-full object-cover"
                        alt={`${primaryFabric.name} fabric swatch`}
                        src={primaryFabric.imageUrl}
                      />
                    </div>
                    <p className="font-label-sm text-label-sm text-outline text-center mt-3 uppercase tracking-widest">
                      Fabric Swatch Preview
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="mb-12">
              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-4">
                Size &amp; Quantity Ledger
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse border border-outline-variant">
                  <thead>
                    <tr className="bg-surface-container font-label-md text-label-md text-on-surface uppercase tracking-widest">
                      <th className="p-4 border-b border-outline-variant font-medium">Size</th>
                      <th className="p-4 border-b border-outline-variant font-medium text-right">
                        Unit Price
                      </th>
                      <th className="p-4 border-b border-outline-variant font-medium text-right">
                        Quantity
                      </th>
                      <th className="p-4 border-b border-outline-variant font-medium text-right">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="font-body-md text-body-md text-on-surface">
                    {order.lines.map((line, index) => (
                      <tr
                        key={line.id}
                        className={`border-b border-outline-variant ${
                          index % 2 === 0 ? "bg-surface-container-lowest" : "bg-surface-container"
                        }`}
                      >
                        <td className="p-4">{line.size}</td>
                        <td className="p-4 text-right">{formatCents(line.unitPriceCents)}</td>
                        <td className="p-4 text-right">{line.quantity}</td>
                        <td className="p-4 text-right">
                          {formatCents(line.quantity * line.unitPriceCents)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-t-2 border-on-surface pt-6">
              <div className="mb-6 md:mb-0">
                <div className="flex items-center gap-2 text-gold bg-gold/10 py-2 px-4 border border-gold w-max">
                  <span className="material-symbols-outlined text-[18px]">schedule</span>
                  <span className="font-label-md text-label-md uppercase tracking-widest">
                    Status: {order.status}
                  </span>
                </div>
              </div>
              <div className="w-full md:w-1/2 lg:w-1/3">
                <div className="flex justify-between py-2 border-b border-outline-variant">
                  <span className="font-body-md text-body-md text-on-surface-variant">
                    Total Units
                  </span>
                  <span className="font-label-md text-label-md text-on-surface">
                    {totalUnits}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-outline-variant">
                  <span className="font-body-md text-body-md text-on-surface-variant">
                    Subtotal
                  </span>
                  <span className="font-label-md text-label-md text-on-surface">
                    {formatCents(subtotalCents)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-outline-variant">
                  <span className="font-body-md text-body-md text-on-surface-variant">
                    Setup &amp; Digitization
                  </span>
                  <span className="font-label-md text-label-md text-on-surface">
                    {formatCents(order.setupFeeCents)}
                  </span>
                </div>
                <div className="flex justify-between py-4 mt-2">
                  <span className="font-headline-sm text-headline-sm text-on-surface">
                    Final Total
                  </span>
                  <span className="font-headline-md text-headline-md text-on-surface">
                    {formatCents(order.totalCents)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </article>

        <div className="max-w-4xl mx-auto mt-12 flex flex-col sm:flex-row justify-end items-center gap-6">
          <button
            type="button"
            disabled
            title="Coming soon"
            className="w-full sm:w-auto px-8 py-4 border border-gold text-gold font-label-md text-label-md uppercase tracking-widest text-center opacity-40 cursor-not-allowed"
          >
            Request changes
          </button>
          <button
            type="button"
            disabled
            title="Coming soon"
            className="w-full sm:w-auto px-8 py-4 bg-gold text-on-gold font-label-md text-label-md uppercase tracking-widest text-center opacity-40 cursor-not-allowed"
          >
            Approve &amp; proceed to payment
          </button>
        </div>
        <p className="max-w-4xl mx-auto text-center font-label-sm text-label-sm text-outline mt-4">
          Approval and payment are not wired up yet — this is a preview of your submitted order.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
