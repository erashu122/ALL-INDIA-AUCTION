"use server";

import { redirect } from "next/navigation";

import { createSession, verifyPassword } from "@/lib/auth";
import { getPortalHome } from "@/lib/auth/access";
import { prisma } from "@/lib/prisma";
import type { SignInFormState } from "@/types/auth";

function getText(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function signInAction(
  _previousState: SignInFormState,
  formData: FormData,
): Promise<SignInFormState> {
  const email = getText(formData, "email").trim().toLowerCase();
  const password = getText(formData, "password");
  const remember = formData.get("remember") === "on";

  const fieldErrors: SignInFormState["fieldErrors"] = {};

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    fieldErrors.email = "Enter a valid work email address.";
  }

  if (!password) {
    fieldErrors.password = "Enter your password.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  let redirectPath: string;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        passwordHash: true,
        mustChangePassword: true,
        organizations: {
          where: { isPrimary: true },
          take: 1,
          select: {
            organization: {
              select: { displayName: true, legalName: true },
            },
          },
        },
      },
    });

    const passwordMatches = user?.passwordHash
      ? await verifyPassword(password, user.passwordHash)
      : false;

    if (!user || user.status !== "ACTIVE" || !passwordMatches) {
      return { error: "Invalid email or password." };
    }

    const organization = user.organizations[0]?.organization;

    await Promise.all([
      createSession(
        {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          organizationName:
            organization?.displayName ?? organization?.legalName,
        },
        remember,
      ),
      prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      }),
    ]);

    redirectPath = user.mustChangePassword
      ? "/change-password"
      : getPortalHome(user.role);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("AUTH_SESSION_SECRET")
    ) {
      return {
        error: "Sign in is unavailable until authentication is configured.",
      };
    }

    return { error: "Unable to sign in right now. Please try again." };
  }

  redirect(redirectPath);
}

export async function signOutAction() {
  const { destroySession } = await import("@/lib/auth");
  await destroySession();
  redirect("/login");
}