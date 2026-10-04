import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import type { AuthenticatedUser } from "@/types/auth";
import {
  canAccessPortal,
  getPortalHome,
  type PortalKey,
} from "./portal-policy";
import type { Role } from "@/types/permissions";

export {
  canAccessPortal,
  getPortalHome,
  type PortalKey,
} from "./portal-policy";

export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  const session = await getSession();

  if (!session) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      passwordChangedAt: true,
      mustChangePassword: true,
      organizations: {
        where: { isPrimary: true },
        take: 1,
        select: {
          organization: {
            select: {
              displayName: true,
              legalName: true,
            },
          },
        },
      },
    },
  });

  if (
    !user ||
    user.status !== "ACTIVE" ||
    (user.passwordChangedAt !== null &&
      session.issuedAt * 1000 < user.passwordChangedAt.getTime())
  ) {
    return null;
  }

  const primaryOrganization = user.organizations[0]?.organization;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    organizationName:
      primaryOrganization?.displayName ?? primaryOrganization?.legalName,
    mustChangePassword: user.mustChangePassword,
  };
}

export async function requirePortalAccess(portal: PortalKey) {
  const user = await requireAuthenticatedUser();

  if (!canAccessPortal(user.role, portal)) {
    redirect(getPortalHome(user.role));
  }

  return user;
}

export async function requireAuthenticatedUser(): Promise<AuthenticatedUser> {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireRole(
  roles: readonly Role[],
): Promise<AuthenticatedUser> {
  const user = await requireAuthenticatedUser();

  if (!roles.includes(user.role)) {
    redirect(getPortalHome(user.role));
  }

  return user;
}