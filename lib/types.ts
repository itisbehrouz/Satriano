export type MaterialComponentType =
  | "MAIN_FABRIC"
  | "LINING"
  | "TRIM"
  | "COLLAR"
  | "CUFF"
  | "SOLE"
  | "HEEL"
  | "UPPER"
  | "BACKING"
  | "FILL"
  | "INTERFACING"
  | "BINDING"
  | "LABEL"
  | "OTHER";

export interface LineItemMaterialSpec {
  materialId: string;
  colorId?: string | null;
  component: MaterialComponentType | string;
  composition?: string;
  ratio?: number;
}

export interface OrderLineMultiMaterial {
  productId: string;
  selectedFit?: string;
  materials: LineItemMaterialSpec[];
  sizeQuantities: Array<{ size: string; quantity: number }>;
}

export interface CreateM2oOrderPayload {
  companyName: string;
  companyEmail: string;
  orderType: "M2O";
  customerTargetPriceCents?: number;
  items: Array<{
    productId: string;
    selectedFit?: string;
    fabricId?: string;
    colorId?: string;
    sizeQuantities: Array<{ size: string; quantity: number }>;
  }>;
  logoAssetId?: string;
  logoPlacement?: "LEFT_CHEST" | "RIGHT_SLEEVE";
}

export interface CreateMultiMaterialOrderPayload {
  companyName: string;
  companyEmail: string;
  orderType?: "M2O" | "WHOLESALE" | "MADE_TO_ORDER";
  customerTargetPriceCents?: number;
  items: OrderLineMultiMaterial[];
  logoAssetId?: string;
  logoPlacement?: "LEFT_CHEST" | "RIGHT_SLEEVE";
}

export interface CreateWholesaleOrderPayload {
  companyName: string;
  companyEmail: string;
  orderType: "WHOLESALE";
  items: Array<{
    skuId: string;
    sizeQuantities: Array<{ size: string; quantity: number }>;
    offeredUnitPriceUSD?: number;
  }>;
}
