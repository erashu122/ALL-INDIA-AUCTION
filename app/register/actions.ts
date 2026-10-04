"use server";

import { prisma } from "@/lib/prisma";
import crypto from "node:crypto";
import { hashPassword } from "@/lib/auth/password";

export type RegistrationInput = {
  organizationName: string;
  organizationType: string;
  participantType: string;
  website: string;
  panNumber: string;
  gstNumber: string;
  businessCategories: string[];
  otherBusinessCategory: string;
  firstName: string;
  lastName: string;
  designation: string;
  mobile: string;
  email: string;
  fax: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  currency: string;
  password: string;
  confirmPassword: string;
  termsAccepted: boolean;
  captchaToken: string;
  captchaAnswer: string;
};

type ActionResult = {
  success: boolean;
  message: string;
  userId?: string;
};

const allowedOrganizationTypes = new Set([
  "Buyer",
  "Seller",
  "Service Provider",
]);

const allowedParticipantTypes = new Set([
  "Buyer",
  "Seller",
  "Service Provider",
  "Buyer & Seller",
]);

const allowedCurrencies = new Set([
  "INR - Indian Rupee",
  "USD - US Dollar",
  "EUR - Euro",
  "GBP - British Pound",
  "AED - UAE Dirham",
  "SGD - Singapore Dollar",
]);

const normalize = (value: string) => value.trim();
const normalizeUpper = (value: string) => normalize(value).toUpperCase();
const normalizeEmail = (value: string) => normalize(value).toLowerCase();

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidIndianMobile(value: string) {
  return /^[6-9]\d{9}$/.test(value);
}

function isValidPostalCode(value: string) {
  return /^\d{6}$/.test(value);
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

function getCaptchaSecret() {
  const secret = process.env.AUTH_SESSION_SECRET;

  if (!secret) {
    throw new Error("AUTH_SESSION_SECRET is not configured.");
  }

  return secret;
}

function signCaptchaPayload(payload: string) {
  return crypto
    .createHmac("sha256", getCaptchaSecret())
    .update(payload)
    .digest("base64url");
}

function encodeCaptchaToken(answer: number, expiresAt: number) {
  const payload = Buffer.from(
    JSON.stringify({ answer, expiresAt }),
  ).toString("base64url");

  return `${payload}.${signCaptchaPayload(payload)}`;
}

function verifyCaptchaToken(token: string, answer: string) {
  try {
    const [payload, signature] = token.split(".");

    if (!payload || !signature) {
      return false;
    }

    const expectedSignature = signCaptchaPayload(payload);

    if (
      signature.length !== expectedSignature.length ||
      !crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature),
      )
    ) {
      return false;
    }

    const decoded = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as { answer?: number; expiresAt?: number };

    return (
      typeof decoded.answer === "number" &&
      typeof decoded.expiresAt === "number" &&
      decoded.expiresAt > Date.now() &&
      decoded.answer === Number(answer)
    );
  } catch {
    return false;
  }
}

export async function createRegistrationCaptchaAction() {
  try {
    const first = crypto.randomInt(1, 20);
    const second = crypto.randomInt(1, 20);
    const answer = first + second;
    const expiresAt = Date.now() + 10 * 60 * 1000;

    return {
      success: true,
      message: "CAPTCHA generated.",
      question: `${first} + ${second} = ?`,
      token: encodeCaptchaToken(answer, expiresAt),
    };
  } catch (error) {
    console.error("Registration CAPTCHA generation failed:", error);

    return {
      success: false,
      message: "Could not generate CAPTCHA. Please refresh and try again.",
    };
  }
}

export async function registerVendorAction(
  input: RegistrationInput,
): Promise<ActionResult> {
  let createdUserId: string | null = null;
  let createdOrganizationId: string | null = null;

  try {
    const organizationName = normalize(input.organizationName);
    const organizationType = normalize(input.organizationType);
    const participantType = normalize(input.participantType);
    const website = normalize(input.website);
    const panNumber = normalizeUpper(input.panNumber);
    const gstNumber = normalizeUpper(input.gstNumber);
    const businessCategories = input.businessCategories
      .map(normalize)
      .filter(Boolean);
    const otherBusinessCategory = normalize(input.otherBusinessCategory);
    const firstName = normalize(input.firstName);
    const lastName = normalize(input.lastName);
    const designation = normalize(input.designation);
    const mobile = normalize(input.mobile).replace(/\D/g, "");
    const email = normalizeEmail(input.email);
    const fax = normalize(input.fax);
    const addressLine1 = normalize(input.addressLine1);
    const addressLine2 = normalize(input.addressLine2);
    const city = normalize(input.city);
    const state = normalize(input.state);
    const country = normalize(input.country);
    const postalCode = normalize(input.postalCode);
    const currency = normalize(input.currency);

    if (!organizationName) {
      return { success: false, message: "Organization name is required." };
    }

    if (!allowedOrganizationTypes.has(organizationType)) {
      return {
        success: false,
        message:
          "Please select Buyer, Seller, or Service Provider as the organization type.",
      };
    }

    if (!allowedParticipantTypes.has(participantType)) {
      return { success: false, message: "Please select a valid participant type." };
    }

    if (!isValidEmail(email)) {
      return { success: false, message: "Please enter a valid email address." };
    }

    if (!firstName || !lastName) {
      return { success: false, message: "First name and last name are required." };
    }

    if (!designation) {
      return { success: false, message: "Designation is required." };
    }

    if (!isValidIndianMobile(mobile)) {
      return {
        success: false,
        message: "Please enter a valid 10-digit Indian mobile number.",
      };
    }

    if (!addressLine1 || !city || !state || !country) {
      return { success: false, message: "Please complete your address details." };
    }

    if (!isValidPostalCode(postalCode)) {
      return { success: false, message: "Please enter a valid 6-digit PIN code." };
    }

    if (!allowedCurrencies.has(currency)) {
      return { success: false, message: "Please select a valid currency." };
    }

    if (!isStrongPassword(input.password)) {
      return {
        success: false,
        message:
          "Password must be at least 8 characters and include uppercase, lowercase, number and special character.",
      };
    }

    if (input.password !== input.confirmPassword) {
      return { success: false, message: "Passwords do not match." };
    }

    if (!input.termsAccepted) {
      return {
        success: false,
        message: "Please accept the Terms and Conditions to continue.",
      };
    }

    if (!verifyCaptchaToken(input.captchaToken, input.captchaAnswer)) {
      return {
        success: false,
        message:
          "Incorrect or expired CAPTCHA. Please solve the new CAPTCHA and try again.",
      };
    }

    if (businessCategories.length === 0) {
      return {
        success: false,
        message: "Please select at least one business category.",
      };
    }

    if (businessCategories.includes("Other") && !otherBusinessCategory) {
      return {
        success: false,
        message: "Please specify your other business category.",
      };
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return {
        success: false,
        message: "An account with this email address already exists.",
      };
    }

    if (panNumber) {
      const existingPan = await prisma.organization.findFirst({
        where: { panNumber },
        select: { id: true },
      });

      if (existingPan) {
        return {
          success: false,
          message: "An organization with this PAN is already registered.",
        };
      }
    }

    if (gstNumber) {
      const existingGst = await prisma.organization.findFirst({
        where: { gstNumber },
        select: { id: true },
      });

      if (existingGst) {
        return {
          success: false,
          message: "An organization with this GST number is already registered.",
        };
      }
    }

    const existingOrganization = await prisma.organization.findFirst({
      where: {
        legalName: {
          equals: organizationName,
          mode: "insensitive",
        },
      },
      select: { id: true },
    });

    if (existingOrganization) {
      return {
        success: false,
        message: "An organization with this name is already registered.",
      };
    }

    const passwordHash = await hashPassword(input.password);

    const created = await prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          legalName: organizationName,
          displayName: organizationName,
          type: "VENDOR",
          entityType: organizationType,
          participantType,
          panNumber: panNumber || null,
          gstNumber: gstNumber || null,
          businessCategories,
          otherBusinessCategory: otherBusinessCategory || null,
          fax: fax || null,
          currency,
          email,
          phone: mobile,
          website: website || null,
          addressLine1,
          addressLine2: addressLine2 || null,
          city,
          state,
          postalCode,
          country,
          isActive: false,
        },
      });

      const user = await tx.user.create({
        data: {
          name: `${firstName} ${lastName}`.trim(),
          email,
          phone: mobile,
          designation,
          passwordHash,
          role: "VENDOR",
          status: "INACTIVE",
          termsAcceptedAt: new Date(),
        },
      });

      await tx.userOrganization.create({
        data: {
          userId: user.id,
          organizationId: organization.id,
          role: "OWNER",
          isPrimary: true,
        },
      });

      return { userId: user.id, organizationId: organization.id };
    });

    createdUserId = created.userId;
    createdOrganizationId = created.organizationId;

    return {
      success: true,
      message:
        "Registration submitted successfully. Your details have been saved and are waiting for the activation process.",
      userId: created.userId,
    };
  } catch (error) {
    console.error("Vendor registration failed:", error);

    if (createdUserId) {
      try {
        await prisma.user.delete({ where: { id: createdUserId } });
      } catch (cleanupError) {
        console.error("Registration user cleanup failed:", cleanupError);
      }
    }

    if (createdOrganizationId) {
      try {
        await prisma.organization.delete({ where: { id: createdOrganizationId } });
      } catch (cleanupError) {
        console.error("Registration organization cleanup failed:", cleanupError);
      }
    }

    return {
      success: false,
      message: "We could not complete your registration right now. Please try again.",
    };
  }
}
