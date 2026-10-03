import { PortalLayout } from "@/components/layout";
import { requirePortalAccess } from "@/lib/auth";

export default async function SupportLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await requirePortalAccess("support");
  return <PortalLayout portal="support" user={user}>{children}</PortalLayout>;
}
