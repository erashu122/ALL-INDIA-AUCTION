"use server";

import crypto from "node:crypto";
import { cookies } from "next/headers";

import { hashOtp, isOtpExpired } from "@/lib/auth/otp";
import { prisma } from "@/lib/prisma";

const MAX_OTP_ATTEMPTS = 5;
const RESET_TOKEN_MAX_AGE_SECONDS = 10 * 60;

export type VerifyOtpResult = {
  success: boolean;
  message: string;
};

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function getAuthSecret() {
  const secret = process.env.AUTH_SESSION_SECRET;

  if (!secret) {
    throw new Error("AUTH_SESSION_SECRET is not configured.");
  }

  return secret;
}

function createPasswordResetToken(userId: string) {
  const expiresAt = Date.now() + RESET_TOKEN_MAX_AGE_SECONDS * 1000;
  const payload = `${userId}.${expiresAt}`;

  const signature = crypto
    .createHmac("sha256", getAuthSecret())
    .update(payload)
    .digest("base64url");

  return `${Buffer.from(payload).toString("base64url")}.${signature}`;
}

export async function verifyForgotPasswordOtpAction(
  _previousState: VerifyOtpResult,
  formData: FormData,
): Promise<VerifyOtpResult> {
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const otp = String(formData.get("otp") ?? "").trim();

  if (!email) {
    return {
      success: false,
      message: "Email address is required.",
    };
  }

  if (!/^\d{6}$/.test(otp)) {
    return {
      success: false,
      message: "Please enter the 6-digit OTP.",
    };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
      },
    });

    /*
     * Do not reveal whether this email belongs to an account.
     */
    if (!user) {
      return {
        success: false,
        message: "Invalid or expired OTP.",
      };
    }

    const verificationCode =
      await prisma.emailVerificationCode.findFirst({
        where: {
          userId: user.id,
          usedAt: null,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    if (!verificationCode) {
      return {
        success: false,
        message:
          "This OTP is no longer valid. Please request a new OTP.",
      };
    }

    if (verificationCode.attempts >= MAX_OTP_ATTEMPTS) {
      await prisma.emailVerificationCode.update({
        where: {
          id: verificationCode.id,
        },
        data: {
          usedAt: new Date(),
        },
      });

      return {
        success: false,
        message:
          "Too many incorrect attempts. Please request a new OTP.",
      };
    }

    if (isOtpExpired(verificationCode.expiresAt)) {
      await prisma.emailVerificationCode.update({
        where: {
          id: verificationCode.id,
        },
        data: {
          usedAt: new Date(),
        },
      });

      return {
        success: false,
        message:
          "This OTP has expired. Please request a new OTP.",
      };
    }

    const providedHash = hashOtp(otp);

    const hashesMatch = crypto.timingSafeEqual(
      Buffer.from(providedHash, "hex"),
      Buffer.from(verificationCode.codeHash, "hex"),
    );

    if (!hashesMatch) {
      const nextAttempts = verificationCode.attempts + 1;

      await prisma.emailVerificationCode.update({
        where: {
          id: verificationCode.id,
        },
        data: {
          attempts: nextAttempts,
          ...(nextAttempts >= MAX_OTP_ATTEMPTS
            ? { usedAt: new Date() }
            : {}),
        },
      });

      if (nextAttempts >= MAX_OTP_ATTEMPTS) {
        return {
          success: false,
          message:
            "Too many incorrect attempts. Please request a new OTP.",
        };
      }

      return {
        success: false,
        message: `Incorrect OTP. ${
          MAX_OTP_ATTEMPTS - nextAttempts
        } attempts remaining.`,
      };
    }

    /*
     * OTP verified successfully.
     * Mark it as used so it cannot be reused.
     */
    await prisma.emailVerificationCode.update({
      where: {
        id: verificationCode.id,
      },
      data: {
        usedAt: new Date(),
      },
    });

    /*
     * Create a short-lived password-reset authorization cookie.
     * The password is NOT changed at this stage.
     */
    const resetToken = createPasswordResetToken(user.id);
    const cookieStore = await cookies();

    cookieStore.set("password_reset_token", resetToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: RESET_TOKEN_MAX_AGE_SECONDS,
      path: "/",
    });

    return {
      success: true,
      message: "OTP verified successfully.",
    };
  } catch (error) {
    console.error("Forgot password OTP verification failed:", error);

    return {
      success: false,
      message:
        "We could not verify the OTP right now. Please try again.",
    };
  }
}