import { validateCreateOrderInput, validateCreateOrderInputMultiMaterial } from "./orderValidation";
import { M2oCart, convertM2oCartToOrderPayload } from "./m2oCart";

export async function submitM2oOrder(
  cart: M2oCart,
  useMultiMaterial: boolean
): Promise<{
  success: boolean;
  orderId?: string;
  error?: string;
}> {
  const payload = convertM2oCartToOrderPayload(cart, useMultiMaterial);

  let validation: { success: boolean; data?: any; error?: string };
  if (useMultiMaterial) {
    const result = validateCreateOrderInputMultiMaterial(payload);
    validation = { success: result.success, data: result.data, error: result.error };
  } else {
    const result = validateCreateOrderInput(payload);
    validation = { success: result.valid, data: result.valid ? result.data : undefined, error: !result.valid ? result.error : undefined };
  }

  if (!validation.success) {
    return { success: false, error: validation.error };
  }

  try {
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validation.data),
    });

    if (!response.ok) {
      const err = await response.json();
      return { success: false, error: err.error || "Order submission failed" };
    }

    const order = await response.json();
    return { success: true, orderId: order.orderId || order.id };
  } catch (error: any) {
    return { success: false, error: error.message || "Network error" };
  }
}

export async function submitWholesaleOrder(cart: any): Promise<{
  success: boolean;
  orderId?: string;
  error?: string;
}> {
  try {
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...cart,
        orderType: "WHOLESALE",
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      return { success: false, error: err.error || "Wholesale order submission failed" };
    }

    const order = await response.json();
    return { success: true, orderId: order.orderId || order.id };
  } catch (error: any) {
    return { success: false, error: error.message || "Network error" };
  }
}
