import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyCustomerToken } from "@/lib/customerAuth";

export interface CustomerSession {
  email: string;
  companyName: string;
  authenticated: boolean;
}

export async function getCustomerSession(): Promise<CustomerSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("sat_customer_token")?.value;
    if (!token) return null;

    const verified = await verifyCustomerToken(token);
    if (!verified || !verified.email) return null;

    const company = await prisma.company.findFirst({
      where: { email: verified.email },
      select: { name: true },
    });

    const companyName = company?.name || verified.email.split("@")[0].toUpperCase();

    return {
      email: verified.email,
      companyName,
      authenticated: true,
    };
  } catch {
    return null;
  }
}
