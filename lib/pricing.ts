export interface SizeQuantity {
  size: string;
  quantity: number;
}

export interface PricingInput {
  fabric: {
    unitPriceCents: number;
    setupFeeCents: number;
  };
  sizeQuantities: SizeQuantity[];
}

export interface PricingLineItem {
  size: string;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
}

export interface PricingResult {
  lineItems: PricingLineItem[];
  totalUnits: number;
  subtotalCents: number;
  setupFeeCents: number;
  totalCents: number;
}

export function computeOrderPricing({ fabric, sizeQuantities }: PricingInput): PricingResult {
  for (const { quantity } of sizeQuantities) {
    if (!Number.isInteger(quantity) || quantity < 0) {
      throw new RangeError(`quantity must be a non-negative integer, got ${quantity}`);
    }
  }

  const lineItems = sizeQuantities
    .filter(({ quantity }) => quantity > 0)
    .map(({ size, quantity }) => ({
      size,
      quantity,
      unitPriceCents: fabric.unitPriceCents,
      lineTotalCents: quantity * fabric.unitPriceCents,
    }));

  const totalUnits = lineItems.reduce((sum, line) => sum + line.quantity, 0);
  const subtotalCents = lineItems.reduce((sum, line) => sum + line.lineTotalCents, 0);
  const setupFeeCents = totalUnits > 0 ? fabric.setupFeeCents : 0;

  return {
    lineItems,
    totalUnits,
    subtotalCents,
    setupFeeCents,
    totalCents: subtotalCents + setupFeeCents,
  };
}
