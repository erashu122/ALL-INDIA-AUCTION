import crypto from "node:crypto";

const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 10;

export function generateOtp(): string {
  const minimum = 10 ** (OTP_LENGTH - 1);
  const maximum = 10 ** OTP_LENGTH;

  return crypto.randomInt(minimum, maximum).toString().padStart(OTP_LENGTH, "0");
}

export function hashOtp(otp: string): string {
  const secret =
    process.env.AUTH_SESSION_SECRET ?? process.env.OTP_HASH_SECRET;

  if (!secret) {
    throw new Error(
      "AUTH_SESSION_SECRET or OTP_HASH_SECRET must be configured.",
    );
  }

  return crypto
    .createHmac("sha256", secret)
    .update(otp)
    .digest("hex");
}

export function getOtpExpiry(): Date {
  return new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
}

export function isOtpExpired(expiresAt: Date): boolean {
  return expiresAt.getTime() <= Date.now();
}