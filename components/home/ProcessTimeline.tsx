export function ProcessTimeline() {
  const steps = [
    {
      num: "01",
      title: "CONFIGURE",
      desc: "Select product, fabric line, fit, and size quantities from admin-defined producible options. No free-text measurements.",
    },
    {
      num: "02",
      title: "SUBMIT YOUR TARGET PRICE",
      desc: "You see the fabric price range and name the unit price that works for your program. Upload your vector logo with the spec.",
    },
    {
      num: "03",
      title: "PROFORMA REVIEW",
      desc: "We review feasibility against your target and issue a proforma invoice with itemized costs. No hidden fees.",
    },
    {
      num: "04",
      title: "PRODUCTION",
      desc: "On approval and payment, your order and brand assets go straight to the production line.",
    },
  ];

  return (
    <section className="w-full py-16 px-6 lg:px-8 bg-[var(--color-bg)] transition-colors">
      <div className="max-w-[1440px] mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16 md:mb-24">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--color-text-primary)]">
            How It Works
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)] mt-2">
            From configuration to production line — four steps, no hidden pricing.
          </p>
        </div>

        <div className="relative">
          {/* Mobile vertical connecting line */}
          <div className="block md:hidden absolute left-6 top-10 bottom-10 w-px bg-[var(--color-border)] z-0" />

          {/* Desktop horizontal connecting line */}
          <div className="hidden lg:block absolute left-6 right-6 top-5 h-px bg-[var(--color-border)] z-0" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-12 md:gap-x-12 lg:gap-x-8">
            {steps.map((step) => (
              <div
                key={step.num}
                className="relative flex flex-row md:flex-col gap-6 md:gap-4 group cursor-default"
              >
                {/* Step Number */}
                <div className="flex-shrink-0 w-12 h-10 flex items-center justify-center md:justify-start bg-[var(--color-bg)] relative z-10 text-[var(--color-text-secondary)] transition-colors duration-300 group-hover:text-[var(--color-accent)] font-mono font-light text-4xl leading-none tabular-nums tracking-tighter">
                  {step.num}
                </div>

                {/* Text Content */}
                <div className="pt-1 md:pt-0">
                  <h3 className="text-sm font-semibold tracking-widest uppercase text-[var(--color-text-primary)] mb-2 transition-colors duration-300 group-hover:text-[var(--color-accent)]">
                    {step.title}
                  </h3>
                  <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed lg:pr-4">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
