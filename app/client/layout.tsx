import { PortalLayout } from "@/components/layout";
import { requirePortalAccess } from "@/lib/auth";

export default async function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await requirePortalAccess("client");
  return <PortalLayout portal="client" user={user}>{children}</PortalLayout>;
}
