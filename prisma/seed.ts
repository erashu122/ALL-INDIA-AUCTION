import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type OrganizationType, type UserRole } from "@prisma/client";

const SEED_MARKER = "development-seed";
const REQUIRED_CONFIRMATION = "seed-local-development";
const PASSWORD_ROUNDS = 12;

type SeedUser = {
  email: string;
  name: string;
  passwordEnvironmentKey: string;
  role: UserRole;
  organization: SeedOrganization;
  organizationRole: "OWNER" | "ADMIN" | "MEMBER";
};

type SeedOrganization = {
  key: string;
  legalName: string;
  displayName: string;
  type: OrganizationType;
};

const organizations = {
  platform: {
    key: "platform",
    legalName: "E-Auction Development Platform Operations",
    displayName: "Development Platform",
    type: "PLATFORM",
  },
  client: {
    key: "client",
    legalName: "Example Test Client Organization",
    displayName: "Example Test Client",
    type: "CLIENT",
  },
  vendor: {
    key: "vendor",
    legalName: "Example Test Vendor Organization",
    displayName: "Example Test Vendor",
    type: "VENDOR",
  },
} as const satisfies Record<string, SeedOrganization>;

const seedUsers: readonly SeedUser[] = [
  {
    email: "superadmin@example.test",
    name: "Development Super Admin",
    passwordEnvironmentKey: "DEV_SEED_SUPER_ADMIN_PASSWORD",
    role: "SUPER_ADMIN",
    organization: organizations.platform,
    organizationRole: "OWNER",
  },
  {
    email: "admin@example.test",
    name: "Development Admin",
    passwordEnvironmentKey: "DEV_SEED_ADMIN_PASSWORD",
    role: "ADMIN",
    organization: organizations.platform,
    organizationRole: "ADMIN",
  },
  {
    email: "client@example.test",
    name: "Development Client",
    passwordEnvironmentKey: "DEV_SEED_CLIENT_PASSWORD",
    role: "CLIENT",
    organization: organizations.client,
    organizationRole: "OWNER",
  },
  {
    email: "vendor@example.test",
    name: "Development Vendor",
    passwordEnvironmentKey: "DEV_SEED_VENDOR_PASSWORD",
    role: "VENDOR",
    organization: organizations.vendor,
    organizationRole: "OWNER",
  },
  {
    email: "support@example.test",
    name: "Development Support",
    passwordEnvironmentKey: "DEV_SEED_SUPPORT_PASSWORD",
    role: "SUPPORT",
    organization: organizations.platform,
    organizationRole: "MEMBER",
  },
];

function requiredEnvironment(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} must be configured before development seeding.`);
  }

  return value;
}

function assertDevelopmentSeedEnvironment() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Development seeding cannot run in production.");
  }

  if (process.env.ALLOW_DEVELOPMENT_SEED !== REQUIRED_CONFIRMATION) {
    throw new Error(
      "Set ALLOW_DEVELOPMENT_SEED=seed-local-development to run the development seed.",
    );
  }
}

async function findOrCreateOrganization(
  prisma: PrismaClient,
  organization: SeedOrganization,
) {
  const registrationReference = `${SEED_MARKER}:organization:${organization.key}`;
  const existing = await prisma.organization.findFirst({
    where: { registrationReference },
  });

  if (existing) {
    return existing;
  }

  return prisma.organization.create({
    data: {
      legalName: organization.legalName,
      displayName: organization.displayName,
      type: organization.type,
      registrationReference,
    },
  });
}

async function seedUser(
  prisma: PrismaClient,
  seedUserDefinition: SeedUser,
  organizationId: string,
) {
  const authReference = `${SEED_MARKER}:user:${seedUserDefinition.role}`;
  const existing = await prisma.user.findUnique({
    where: { email: seedUserDefinition.email },
    select: { id: true, authReference: true },
  });

  if (existing && existing.authReference !== authReference) {
    throw new Error(
      `Refusing to modify ${seedUserDefinition.email}; it is not a development seed user.`,
    );
  }

  const passwordHash = await bcrypt.hash(
    requiredEnvironment(seedUserDefinition.passwordEnvironmentKey),
    PASSWORD_ROUNDS,
  );
  const user = await prisma.user.upsert({
    where: { email: seedUserDefinition.email },
    create: {
      name: seedUserDefinition.name,
      email: seedUserDefinition.email,
      authReference,
      passwordHash,
      passwordChangedAt: new Date(),
      role: seedUserDefinition.role,
    },
    update: {
      name: seedUserDefinition.name,
      authReference,
      passwordHash,
      passwordChangedAt: new Date(),
      role: seedUserDefinition.role,
      status: "ACTIVE",
    },
  });

  await prisma.userOrganization.updateMany({
    where: { userId: user.id, isPrimary: true },
    data: { isPrimary: false },
  });
  await prisma.userOrganization.upsert({
    where: {
      userId_organizationId: { userId: user.id, organizationId },
    },
    create: {
      userId: user.id,
      organizationId,
      role: seedUserDefinition.organizationRole,
      isPrimary: true,
    },
    update: {
      role: seedUserDefinition.organizationRole,
      isPrimary: true,
    },
  });
}

async function main() {
  assertDevelopmentSeedEnvironment();
  const adapter = new PrismaPg({ connectionString: requiredEnvironment("DATABASE_URL") });
  const prisma = new PrismaClient({ adapter });

  try {
    const seededOrganizations = new Map<string, string>();

    for (const organization of Object.values(organizations)) {
      const record = await findOrCreateOrganization(prisma, organization);
      seededOrganizations.set(organization.key, record.id);
    }

    for (const user of seedUsers) {
      const organizationId = seededOrganizations.get(user.organization.key);

      if (!organizationId) {
        throw new Error(`Missing seeded organization: ${user.organization.key}`);
      }

      await seedUser(prisma, user, organizationId);
    }

    console.log("Development authentication users are ready.");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(() => {
  console.error("Development seed failed.");
  process.exitCode = 1;
});
