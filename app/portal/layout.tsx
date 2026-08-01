import { PortalHeader } from "@/components/layout/PortalHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <PortalHeader />
      <div className="flex-1">{children}</div>
      <SiteFooter />
    </div>
  );
}
