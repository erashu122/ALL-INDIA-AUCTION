"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { getAuthenticatedUser } from "@/lib/auth/access";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";

type ActionResult = {
  success: boolean;
  message: string;
};

type PasswordResetResult = ActionResult & {
  temporaryPassword?: string;
};

async function requireAdmin() {
  const user = await getAuthenticatedUser();

  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    throw new Error("Unauthorized");
  }

  return user;
}

function generateTemporaryPassword() {
  return `Auc@${crypto.randomBytes(6).toString("base64url")}9`;
}

export async function toggleVendorStatusAction(
  organizationId: string,
): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();

    const organization = await prisma.organization.findUnique({
      where: {
        id: organizationId,
      },
      include: {
        users: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!organization || organization.type !== "VENDOR") {
      return {
        success: false,
        message: "Vendor organization not found.",
      };
    }

    const nextActive = !organization.isActive;

    await prisma.$transaction(async (tx) => {
      await tx.organization.update({
        where: {
          id: organization.id,
        },
        data: {
          isActive: nextActive,
        },
      });

      await tx.user.updateMany({
        where: {
          organizations: {
            some: {
              organizationId: organization.id,
            },
          },
          role: "VENDOR",
        },
        data: {
          status: nextActive ? "ACTIVE" : "INACTIVE",
          passwordChangedAt: new Date(),
        },
      });

      await tx.auditLog.create({
        data: {
          actorUserId: admin.id,
          action: nextActive ? "VENDOR_ACTIVATED" : "VENDOR_DEACTIVATED",
          entityType: "ORGANIZATION",
          entityId: organization.id,
          oldValue: {
            organizationActive: organization.isActive,
            userStatuses: organization.users.map((membership) => ({
              userId: membership.userId,
              status: membership.user.status,
            })),
          },
          newValue: {
            organizationActive: nextActive,
            userStatus: nextActive ? "ACTIVE" : "INACTIVE",
          },
        },
      });
    });

    revalidatePath("/admin/vendors");
    revalidatePath("/vendor");
    revalidatePath("/login");

    return {
      success: true,
      message: nextActive
        ? "Vendor activated successfully. The vendor can now log in."
        : "Vendor deactivated successfully. The vendor can no longer log in.",
    };
  } catch (error) {
    console.error("Vendor status update failed:", error);

    return {
      success: false,
      message:
        error instanceof Error && error.message === "Unauthorized"
          ? "You are not authorized to perform this action."
          : "Could not update vendor status. Please try again.",
    };
  }
}

export async function resetVendorPasswordAction(
  organizationId: string,
): Promise<PasswordResetResult> {
  try {
    const admin = await requireAdmin();

    const organization = await prisma.organization.findUnique({
      where: {
        id: organizationId,
      },
      include: {
        users: {
          where: {
            isPrimary: true,
          },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                status: true,
              },
            },
          },
        },
      },
    });

    const primaryUser = organization?.users[0]?.user;

    if (!organization || organization.type !== "VENDOR" || !primaryUser) {
      return {
        success: false,
        message: "Primary vendor account not found.",
      };
    }

    const temporaryPassword = generateTemporaryPassword();
    const passwordHash = await hashPassword(temporaryPassword);

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: {
          id: primaryUser.id,
        },
        data: {
            passwordHash,
            passwordChangedAt: new Date(),
            mustChangePassword: true,
        },
      });

      await tx.auditLog.create({
        data: {
          actorUserId: admin.id,
          action: "VENDOR_PASSWORD_RESET_BY_ADMIN",
          entityType: "USER",
          entityId: primaryUser.id,
          oldValue: {
            email: primaryUser.email,
          },
          newValue: {
            email: primaryUser.email,
            method: "ADMIN_GENERATED_TEMPORARY_PASSWORD",
          },
        },
      });
    });

    revalidatePath("/admin/vendors");
    revalidatePath("/login");
    revalidatePath("/vendor");

    return {
      success: true,
      message: "Temporary password generated successfully.",
      temporaryPassword,
    };
  } catch (error) {
    console.error("Vendor password reset failed:", error);

    return {
      success: false,
      message:
        error instanceof Error && error.message === "Unauthorized"
          ? "You are not authorized to reset vendor passwords."
          : "Could not reset the vendor password. Please try again.",
    };
  }
}

export async function deleteVendorAction(
  organizationId: string,
): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();

    const organization = await prisma.organization.findUnique({
      where: {
        id: organizationId,
      },
      include: {
        users: {
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            vendorParticipations: true,
            emdRecords: true,
            bids: true,
            paymentRecords: true,
          },
        },
      },
    });

    if (!organization || organization.type !== "VENDOR") {
      return {
        success: false,
        message: "Vendor organization not found.",
      };
    }

    const hasHistory =
      organization._count.vendorParticipations > 0 ||
      organization._count.emdRecords > 0 ||
      organization._count.bids > 0 ||
      organization._count.paymentRecords > 0;

    if (hasHistory) {
      return {
        success: false,
        message:
          "This vendor has auction/payment history, so it cannot be permanently deleted. Deactivate it instead.",
      };
    }

    await prisma.$transaction(async (tx) => {
      await tx.auditLog.create({
        data: {
          actorUserId: admin.id,
          action: "VENDOR_DELETED",
          entityType: "ORGANIZATION",
          entityId: organization.id,
          oldValue: {
            legalName: organization.legalName,
            displayName: organization.displayName,
            userIds: organization.users.map((membership) => membership.userId),
          },
        },
      });

      await tx.userOrganization.deleteMany({
        where: {
          organizationId: organization.id,
        },
      });

      await tx.organization.delete({
        where: {
          id: organization.id,
        },
      });

      for (const membership of organization.users) {
        const remainingMemberships = await tx.userOrganization.count({
          where: {
            userId: membership.userId,
          },
        });

        if (remainingMemberships === 0) {
          await tx.user.delete({
            where: {
              id: membership.userId,
            },
          });
        }
      }
    });

    revalidatePath("/admin/vendors");

    return {
      success: true,
      message: "Vendor deleted successfully.",
    };
  } catch (error) {
    console.error("Vendor deletion failed:", error);

    return {
      success: false,
      message:
        error instanceof Error && error.message === "Unauthorized"
          ? "You are not authorized to perform this action."
          : "Could not delete this vendor. Please try again.",
    };
  }
}
