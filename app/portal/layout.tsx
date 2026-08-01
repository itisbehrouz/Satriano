import { cookies } from "next/headers";
import { verifyCustomerToken } from "@/lib/customerAuth";
import { PortalHeader } from "@/components/layout/PortalHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("sat_customer_token")?.value;
  const session = token ? await verifyCustomerToken(token) : null;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] rounded-none select-none font-sans">
      <PortalHeader sessionEmail={session?.email ?? null} />
      <div className="flex-1 rounded-none">{children}</div>
      <SiteFooter />
    </div>
  );
}
