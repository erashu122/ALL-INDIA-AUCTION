import { PortalDashboard } from "@/components/portal";
import { requirePortalAccess } from "@/lib/auth";

export default async function ClientPage() {
  const user = await requirePortalAccess("client");
  return <PortalDashboard portal="client" user={user} />;
}
