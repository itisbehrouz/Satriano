import { cookies } from "next/headers";
import { verifyCustomerToken } from "@/lib/customerAuth";
import { prisma } from "@/lib/prisma";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("sat_customer_token")?.value;
  const session = token ? await verifyCustomerToken(token) : null;

  let initialCompanyName: string | null = null;
  if (session?.email) {
    const company = await prisma.company.findFirst({
      where: { email: session.email },
      select: { name: true },
    });
    initialCompanyName = company?.name || session.email.split("@")[0].toUpperCase();
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] rounded-none select-none font-sans">
      <PortalHeader initialCompanyName={initialCompanyName} />
      <div className="flex-1 rounded-none">{children}</div>
      <SiteFooter />
    </div>
  );
}
