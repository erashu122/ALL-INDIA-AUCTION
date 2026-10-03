import { PortalShell } from "@/components/portal";
import type { PortalKind } from "@/config/portals";
import type { AuthenticatedUser } from "@/types/auth";

type PortalLayoutProps = {
  children: React.ReactNode;
  portal: PortalKind;
  user: AuthenticatedUser;
};

export function PortalLayout({ children, portal, user }: PortalLayoutProps) {
  return <PortalShell portal={portal} user={user}>{children}</PortalShell>;
}
