import { CheckoutClient } from "./CheckoutClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout | Satriano Atelier",
  description: "Review and submit your custom apparel order specification.",
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}
