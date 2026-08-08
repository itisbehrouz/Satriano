export interface QuickBooksConfig {
  realmId: string;
  accessToken: string;
  refreshToken: string;
}

export async function syncOrderToQuickBooks(
  orderId: string,
  qbConfig: QuickBooksConfig
): Promise<{ success: boolean; qbInvoiceId?: string; error?: string }> {
  return {
    success: false,
    error: "QuickBooks integration not yet implemented",
  };
}

export async function syncPaymentToQuickBooks(
  orderId: string,
  amountCents: number,
  qbConfig: QuickBooksConfig
): Promise<{ success: boolean; qbDepositId?: string }> {
  return { success: false };
}
