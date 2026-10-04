"use server";

import { redirect } from "next/navigation";

import { getAuthenticatedUser } from "@/lib/auth/access";
import { createSession, destroySession } from "@/lib/auth/session";
import { hashPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/prisma";

export type ChangePasswordState = {
  success: boolean;
  message: string;
};

function isStrongPassword(value: string) {
  return (
    value.length >= 8 &&
    /[A-Z]/.test(value) &&
    /[a-z]/.test(value) &&
    /\d/.test(value) &&
    /[^A-Za-z0-9]/.test(value)
  );
}

export async function changePasswordAction(
  _previousState: ChangePasswordState,
  formData: FormData,
): Promise<ChangePasswordState> {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!password) {
    return {
      success: false,
      message: "Please enter your new password.",
    };
  }

  if (!isStrongPassword(password)) {
    return {
      success: false,
      message:
        "Password must be at least 8 characters and include uppercase, lowercase, number and special character.",
    };
  }

  if (password !== confirmPassword) {
    return {
      success: false,
      message: "Passwords do not match.",
    };
  }

  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  try {
    const passwordHash = await hashPassword(password);

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        passwordHash,
        passwordChangedAt: new Date(),
        mustChangePassword: false,
      },
    });

    /*
     * passwordChangedAt invalidates the existing session.
     * Destroy it explicitly and create a fresh authenticated session.
     */
    await destroySession();

    await createSession(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationName: user.organizationName,
      },
      true,
    );

    return {
      success: true,
      message: "Your password has been changed successfully.",
    };
  } catch (error) {
    console.error("Change password failed:", error);

    return {
      success: false,
      message:
        "We could not change your password right now. Please try again.",
    };
  }
}