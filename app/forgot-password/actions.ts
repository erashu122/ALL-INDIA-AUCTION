"use server";

import { prisma } from "@/lib/prisma";
import {
  generateOtp,
  getOtpExpiry,
  hashOtp,
} from "@/lib/auth/otp";
import { sendForgotPasswordOtpEmail } from "@/lib/email";
import { redirect } from "next/navigation";

export type ForgotPasswordState = {
  success?: boolean;
  message?: string;
  email?: string;
};

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function sendForgotPasswordOtpAction(
  _previousState: ForgotPasswordState,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const email = normalizeEmail(String(formData.get("email") ?? ""));

  if (!email) {
    return {
      success: false,
      message: "Please enter your registered email address.",
    };
  }

  if (!isValidEmail(email)) {
    return {
      success: false,
      message: "Please enter a valid email address.",
    };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    /*
     * Do not reveal whether an email address exists.
     * Always continue to the OTP verification screen.
     */
    if (!user) {
      redirect(
        `/forgot-password/verify?email=${encodeURIComponent(email)}`,
      );
    }

    /*
     * Invalidate previous unused OTPs for this user.
     */
    await prisma.emailVerificationCode.updateMany({
      where: {
        userId: user.id,
        usedAt: null,
      },
      data: {
        usedAt: new Date(),
      },
    });

    const otp = generateOtp();
    const codeHash = hashOtp(otp);
    const expiresAt = getOtpExpiry();

    await prisma.emailVerificationCode.create({
      data: {
        userId: user.id,
        codeHash,
        expiresAt,
      },
    });

    await sendForgotPasswordOtpEmail({
      email: user.email,
      name: user.name,
      otp,
    });

    redirect(
      `/forgot-password/verify?email=${encodeURIComponent(user.email)}`,
    );
  } catch (error) {
    /*
     * Next.js redirect() throws internally to perform the redirect.
     * Do not convert that into the generic error response.
     */
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      typeof error.digest === "string" &&
      error.digest.startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }

    console.error("Forgot password OTP request failed:", error);

    return {
      success: false,
      message:
        "We could not process your request right now. Please try again.",
    };
  }
}