export interface QuickBooksConfig {
  realmId: string;
  accessToken: string;
  refreshToken: string;
}

export async function syncOrderToQuickBooks(
  _orderId: string,
  _qbConfig: QuickBooksConfig
): Promise<{ success: boolean; qbInvoiceId?: string; error?: string }> {
  return {
    success: false,
    error: "QuickBooks integration not yet implemented",
  };
}

export async function syncPaymentToQuickBooks(
  _orderId: string,
  _amountCents: number,
  _qbConfig: QuickBooksConfig
): Promise<{ success: boolean; qbDepositId?: string }> {
  return { success: false };
}
