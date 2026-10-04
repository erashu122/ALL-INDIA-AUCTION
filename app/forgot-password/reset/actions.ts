"use server";

import crypto from "node:crypto";
import { cookies } from "next/headers";

import { hashPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/prisma";

export type ResetPasswordState = {
  success: boolean;
  message: string;
};

function getAuthSecret() {
  const secret = process.env.AUTH_SESSION_SECRET;

  if (!secret) {
    throw new Error("AUTH_SESSION_SECRET is not configured.");
  }

  return secret;
}

function isStrongPassword(value: string) {
  return (
    value.length >= 8 &&
    /[A-Z]/.test(value) &&
    /[a-z]/.test(value) &&
    /\d/.test(value) &&
    /[^A-Za-z0-9]/.test(value)
  );
}

function verifyPasswordResetToken(token: string) {
  try {
    const [encodedPayload, signature] = token.split(".");

    if (!encodedPayload || !signature) {
      return null;
    }

    const payload = Buffer.from(
      encodedPayload,
      "base64url",
    ).toString("utf8");

    const expectedSignature = crypto
      .createHmac("sha256", getAuthSecret())
      .update(payload)
      .digest("base64url");

    const providedBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (
      providedBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(providedBuffer, expectedBuffer)
    ) {
      return null;
    }

    const [userId, expiresAtValue] = payload.split(".");
    const expiresAt = Number(expiresAtValue);

    if (!userId || !Number.isFinite(expiresAt)) {
      return null;
    }

    if (expiresAt <= Date.now()) {
      return null;
    }

    return {
      userId,
      expiresAt,
    };
  } catch {
    return null;
  }
}

export async function resetPasswordAction(
  _previousState: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(
    formData.get("confirmPassword") ?? "",
  );

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

  try {
    const cookieStore = await cookies();
    const resetToken = cookieStore.get("password_reset_token")?.value;

    if (!resetToken) {
      return {
        success: false,
        message:
          "Your password reset session has expired. Please request a new OTP.",
      };
    }

    const tokenData = verifyPasswordResetToken(resetToken);

    if (!tokenData) {
      cookieStore.delete("password_reset_token");

      return {
        success: false,
        message:
          "Your password reset session has expired. Please request a new OTP.",
      };
    }

    const user = await prisma.user.findUnique({
      where: {
        id: tokenData.userId,
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      cookieStore.delete("password_reset_token");

      return {
        success: false,
        message:
          "Your password reset session is no longer valid. Please request a new OTP.",
      };
    }

    const passwordHash = await hashPassword(password);

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        passwordHash,
        passwordChangedAt: new Date(),
      },
    });

    cookieStore.delete("password_reset_token");

    return {
      success: true,
      message: "Your password has been reset successfully.",
    };
  } catch (error) {
    console.error("Password reset failed:", error);

    return {
      success: false,
      message:
        "We could not reset your password right now. Please try again.",
    };
  }
}