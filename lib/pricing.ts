export interface SizeQuantity {
  size: string;
  quantity: number;
}

export interface PricingInput {
  fabric: {
    priceMinCents: number;
    priceMaxCents: number;
    setupFeeCents?: number;
  };
  sizeQuantities: SizeQuantity[];
}

export interface PricingLineItem {
  size: string;
  quantity: number;
  priceMinCents: number;
  priceMaxCents: number;
}

export interface PricingResult {
  lineItems: PricingLineItem[];
  totalUnits: number;
  priceMinCents: number;
  priceMaxCents: number;
  estimatedSubtotalMinCents: number;
  estimatedSubtotalMaxCents: number;
  setupFeeCents: number;
  estimatedTotalMinCents: number;
  estimatedTotalMaxCents: number;
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
      priceMinCents: fabric.priceMinCents,
      priceMaxCents: fabric.priceMaxCents,
    }));

  const totalUnits = lineItems.reduce((sum, line) => sum + line.quantity, 0);
  const estimatedSubtotalMinCents = totalUnits * fabric.priceMinCents;
  const estimatedSubtotalMaxCents = totalUnits * fabric.priceMaxCents;

  return {
    lineItems,
    totalUnits,
    priceMinCents: fabric.priceMinCents,
    priceMaxCents: fabric.priceMaxCents,
    estimatedSubtotalMinCents,
    estimatedSubtotalMaxCents,
    setupFeeCents: 0,
    estimatedTotalMinCents: estimatedSubtotalMinCents,
    estimatedTotalMaxCents: estimatedSubtotalMaxCents,
  };
}
