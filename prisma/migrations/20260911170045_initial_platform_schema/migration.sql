-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'CLIENT', 'VENDOR', 'SUPPORT');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "OrganizationType" AS ENUM ('CLIENT', 'VENDOR', 'PLATFORM');

-- CreateEnum
CREATE TYPE "OrganizationMemberRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "AuctionType" AS ENUM ('FORWARD', 'REVERSE', 'RANK');

-- CreateEnum
CREATE TYPE "AuctionStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'PUBLISHED', 'UPCOMING', 'LIVE', 'EXTENDED', 'CLOSED', 'RESULT_DECLARED', 'COMPLETED', 'REJECTED', 'CANCELLED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "AuctionVisibility" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateEnum
CREATE TYPE "ParticipationType" AS ENUM ('OPEN', 'RESTRICTED');

-- CreateEnum
CREATE TYPE "BidDirection" AS ENUM ('UPWARD', 'DOWNWARD', 'RANK_BASED');

-- CreateEnum
CREATE TYPE "ItemStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('TENDER', 'TECHNICAL_SPECIFICATION', 'COMMERCIAL_TERMS', 'ELIGIBILITY', 'EMD', 'CLARIFICATION', 'RESULT', 'OTHER');

-- CreateEnum
CREATE TYPE "RequirementState" AS ENUM ('REQUIRED', 'OPTIONAL');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO');

-- CreateEnum
CREATE TYPE "ParticipationStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "EligibilityStatus" AS ENUM ('PENDING', 'ELIGIBLE', 'INELIGIBLE');

-- CreateEnum
CREATE TYPE "EmdStatus" AS ENUM ('NOT_REQUIRED', 'PENDING', 'SUBMITTED', 'VERIFIED', 'REJECTED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "BidStatus" AS ENUM ('SUBMITTED', 'ACCEPTED', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "ResultStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'DECLARED', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentRecordType" AS ENUM ('EMD', 'SECURITY', 'AUCTION', 'OTHER');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'INITIATED', 'RECEIVED', 'VERIFIED', 'FAILED', 'REFUNDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('SYSTEM', 'AUCTION', 'DOCUMENT', 'PAYMENT', 'SUPPORT');

-- CreateEnum
CREATE TYPE "AuditEntityType" AS ENUM ('USER', 'ORGANIZATION', 'AUCTION', 'AUCTION_ITEM', 'AUCTION_DOCUMENT', 'AUCTION_MEDIA', 'VENDOR_PARTICIPATION', 'EMD_RECORD', 'BID', 'AUCTION_RESULT', 'PAYMENT_RECORD', 'NOTIFICATION', 'SYSTEM');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "authReference" TEXT,
    "passwordHash" TEXT,
    "passwordChangedAt" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "role" "UserRole" NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "legalName" TEXT NOT NULL,
    "displayName" TEXT,
    "type" "OrganizationType" NOT NULL,
    "registrationReference" TEXT,
    "taxReference" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "city" TEXT,
    "state" TEXT,
    "postalCode" TEXT,
    "country" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserOrganization" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "role" "OrganizationMemberRole" NOT NULL DEFAULT 'MEMBER',
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserOrganization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Auction" (
    "id" TEXT NOT NULL,
    "auctionNumber" TEXT NOT NULL,
    "tenderNumber" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "AuctionType" NOT NULL,
    "status" "AuctionStatus" NOT NULL DEFAULT 'DRAFT',
    "visibility" "AuctionVisibility" NOT NULL DEFAULT 'PRIVATE',
    "participationType" "ParticipationType" NOT NULL DEFAULT 'RESTRICTED',
    "bidDirection" "BidDirection" NOT NULL,
    "clientOrganizationId" TEXT NOT NULL,
    "location" TEXT,
    "timezone" TEXT NOT NULL,
    "scheduledStartAt" TIMESTAMP(3) NOT NULL,
    "scheduledEndAt" TIMESTAMP(3) NOT NULL,
    "participationDeadlineAt" TIMESTAMP(3),
    "currency" TEXT NOT NULL,
    "startingPrice" DECIMAL(18,2),
    "bidStepAmount" DECIMAL(18,2),
    "minimumBidValue" DECIMAL(18,2),
    "maximumBidValue" DECIMAL(18,2),
    "quantity" DECIMAL(18,3),
    "unit" TEXT,
    "autoExtensionEnabled" BOOLEAN NOT NULL DEFAULT false,
    "extensionDurationMinutes" INTEGER,
    "extensionTriggerMinutes" INTEGER,
    "maximumExtensions" INTEGER,
    "emdRequired" BOOLEAN NOT NULL DEFAULT false,
    "emdAmount" DECIMAL(18,2),
    "emdCurrency" TEXT,
    "securityDepositRequirement" TEXT,
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT,
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Auction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuctionItem" (
    "id" TEXT NOT NULL,
    "auctionId" TEXT NOT NULL,
    "lotNumber" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "quantity" DECIMAL(18,3) NOT NULL,
    "unit" TEXT NOT NULL,
    "location" TEXT,
    "specifications" JSONB,
    "startingPrice" DECIMAL(18,2),
    "currency" TEXT,
    "status" "ItemStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuctionItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuctionDocument" (
    "id" TEXT NOT NULL,
    "auctionId" TEXT NOT NULL,
    "auctionItemId" TEXT,
    "name" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "fileKey" TEXT NOT NULL,
    "fileName" TEXT,
    "mimeType" TEXT,
    "sizeInBytes" INTEGER,
    "version" INTEGER NOT NULL DEFAULT 1,
    "requirement" "RequirementState" NOT NULL DEFAULT 'OPTIONAL',
    "uploadedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuctionDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuctionMedia" (
    "id" TEXT NOT NULL,
    "auctionId" TEXT NOT NULL,
    "auctionItemId" TEXT,
    "type" "MediaType" NOT NULL,
    "fileKey" TEXT NOT NULL,
    "fileName" TEXT,
    "mimeType" TEXT,
    "sizeInBytes" INTEGER,
    "caption" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuctionMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VendorParticipation" (
    "id" TEXT NOT NULL,
    "auctionId" TEXT NOT NULL,
    "vendorOrganizationId" TEXT NOT NULL,
    "status" "ParticipationStatus" NOT NULL DEFAULT 'DRAFT',
    "eligibilityStatus" "EligibilityStatus" NOT NULL DEFAULT 'PENDING',
    "appliedAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "reviewedById" TEXT,
    "reviewNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VendorParticipation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmdRecord" (
    "id" TEXT NOT NULL,
    "auctionId" TEXT NOT NULL,
    "vendorOrganizationId" TEXT NOT NULL,
    "participationId" TEXT,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "amount" DECIMAL(18,2),
    "currency" TEXT,
    "status" "EmdStatus" NOT NULL DEFAULT 'NOT_REQUIRED',
    "paymentReference" TEXT,
    "submittedAt" TIMESTAMP(3),
    "verifiedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "reviewedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmdRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bid" (
    "id" TEXT NOT NULL,
    "auctionId" TEXT NOT NULL,
    "auctionItemId" TEXT,
    "vendorOrganizationId" TEXT NOT NULL,
    "amount" DECIMAL(18,2),
    "rank" INTEGER,
    "bidValue" TEXT,
    "sequenceNumber" INTEGER NOT NULL,
    "bidReference" TEXT NOT NULL,
    "status" "BidStatus" NOT NULL DEFAULT 'SUBMITTED',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bid_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuctionResult" (
    "id" TEXT NOT NULL,
    "auctionId" TEXT NOT NULL,
    "auctionItemId" TEXT,
    "winningVendorId" TEXT,
    "winningBidId" TEXT,
    "status" "ResultStatus" NOT NULL DEFAULT 'PENDING',
    "declaredAt" TIMESTAMP(3),
    "declaredById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuctionResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentRecord" (
    "id" TEXT NOT NULL,
    "type" "PaymentRecordType" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "amount" DECIMAL(18,2),
    "currency" TEXT,
    "auctionId" TEXT,
    "vendorOrganizationId" TEXT,
    "emdRecordId" TEXT,
    "referenceIdentifier" TEXT,
    "providerPlaceholder" TEXT,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "relatedEntityType" TEXT,
    "relatedEntityId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorUserId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" "AuditEntityType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "oldValue" JSONB,
    "newValue" JSONB,
    "ipAddress" TEXT,
    "deviceMetadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_authReference_key" ON "User"("authReference");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE INDEX "Organization_type_idx" ON "Organization"("type");

-- CreateIndex
CREATE INDEX "Organization_isActive_idx" ON "Organization"("isActive");

-- CreateIndex
CREATE INDEX "Organization_legalName_idx" ON "Organization"("legalName");

-- CreateIndex
CREATE INDEX "UserOrganization_organizationId_idx" ON "UserOrganization"("organizationId");

-- CreateIndex
CREATE INDEX "UserOrganization_role_idx" ON "UserOrganization"("role");

-- CreateIndex
CREATE UNIQUE INDEX "UserOrganization_userId_organizationId_key" ON "UserOrganization"("userId", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Auction_auctionNumber_key" ON "Auction"("auctionNumber");

-- CreateIndex
CREATE INDEX "Auction_auctionNumber_idx" ON "Auction"("auctionNumber");

-- CreateIndex
CREATE INDEX "Auction_status_idx" ON "Auction"("status");

-- CreateIndex
CREATE INDEX "Auction_type_idx" ON "Auction"("type");

-- CreateIndex
CREATE INDEX "Auction_visibility_idx" ON "Auction"("visibility");

-- CreateIndex
CREATE INDEX "Auction_participationType_idx" ON "Auction"("participationType");

-- CreateIndex
CREATE INDEX "Auction_clientOrganizationId_idx" ON "Auction"("clientOrganizationId");

-- CreateIndex
CREATE INDEX "Auction_scheduledStartAt_idx" ON "Auction"("scheduledStartAt");

-- CreateIndex
CREATE INDEX "Auction_scheduledEndAt_idx" ON "Auction"("scheduledEndAt");

-- CreateIndex
CREATE INDEX "Auction_status_scheduledStartAt_idx" ON "Auction"("status", "scheduledStartAt");

-- CreateIndex
CREATE INDEX "Auction_status_scheduledEndAt_idx" ON "Auction"("status", "scheduledEndAt");

-- CreateIndex
CREATE INDEX "AuctionItem_auctionId_idx" ON "AuctionItem"("auctionId");

-- CreateIndex
CREATE INDEX "AuctionItem_status_idx" ON "AuctionItem"("status");

-- CreateIndex
CREATE UNIQUE INDEX "AuctionItem_auctionId_lotNumber_key" ON "AuctionItem"("auctionId", "lotNumber");

-- CreateIndex
CREATE INDEX "AuctionDocument_auctionId_idx" ON "AuctionDocument"("auctionId");

-- CreateIndex
CREATE INDEX "AuctionDocument_auctionItemId_idx" ON "AuctionDocument"("auctionItemId");

-- CreateIndex
CREATE INDEX "AuctionDocument_type_idx" ON "AuctionDocument"("type");

-- CreateIndex
CREATE INDEX "AuctionDocument_uploadedById_idx" ON "AuctionDocument"("uploadedById");

-- CreateIndex
CREATE INDEX "AuctionMedia_auctionId_idx" ON "AuctionMedia"("auctionId");

-- CreateIndex
CREATE INDEX "AuctionMedia_auctionItemId_idx" ON "AuctionMedia"("auctionItemId");

-- CreateIndex
CREATE INDEX "AuctionMedia_type_idx" ON "AuctionMedia"("type");

-- CreateIndex
CREATE INDEX "VendorParticipation_auctionId_idx" ON "VendorParticipation"("auctionId");

-- CreateIndex
CREATE INDEX "VendorParticipation_vendorOrganizationId_idx" ON "VendorParticipation"("vendorOrganizationId");

-- CreateIndex
CREATE INDEX "VendorParticipation_status_idx" ON "VendorParticipation"("status");

-- CreateIndex
CREATE INDEX "VendorParticipation_eligibilityStatus_idx" ON "VendorParticipation"("eligibilityStatus");

-- CreateIndex
CREATE UNIQUE INDEX "VendorParticipation_auctionId_vendorOrganizationId_key" ON "VendorParticipation"("auctionId", "vendorOrganizationId");

-- CreateIndex
CREATE INDEX "EmdRecord_auctionId_idx" ON "EmdRecord"("auctionId");

-- CreateIndex
CREATE INDEX "EmdRecord_vendorOrganizationId_idx" ON "EmdRecord"("vendorOrganizationId");

-- CreateIndex
CREATE INDEX "EmdRecord_status_idx" ON "EmdRecord"("status");

-- CreateIndex
CREATE INDEX "EmdRecord_paymentReference_idx" ON "EmdRecord"("paymentReference");

-- CreateIndex
CREATE UNIQUE INDEX "EmdRecord_auctionId_vendorOrganizationId_key" ON "EmdRecord"("auctionId", "vendorOrganizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Bid_bidReference_key" ON "Bid"("bidReference");

-- CreateIndex
CREATE INDEX "Bid_auctionId_idx" ON "Bid"("auctionId");

-- CreateIndex
CREATE INDEX "Bid_auctionItemId_idx" ON "Bid"("auctionItemId");

-- CreateIndex
CREATE INDEX "Bid_vendorOrganizationId_idx" ON "Bid"("vendorOrganizationId");

-- CreateIndex
CREATE INDEX "Bid_auctionId_vendorOrganizationId_idx" ON "Bid"("auctionId", "vendorOrganizationId");

-- CreateIndex
CREATE INDEX "Bid_auctionId_auctionItemId_submittedAt_idx" ON "Bid"("auctionId", "auctionItemId", "submittedAt");

-- CreateIndex
CREATE INDEX "Bid_status_idx" ON "Bid"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Bid_auctionId_sequenceNumber_key" ON "Bid"("auctionId", "sequenceNumber");

-- CreateIndex
CREATE INDEX "AuctionResult_auctionId_idx" ON "AuctionResult"("auctionId");

-- CreateIndex
CREATE INDEX "AuctionResult_auctionItemId_idx" ON "AuctionResult"("auctionItemId");

-- CreateIndex
CREATE INDEX "AuctionResult_winningVendorId_idx" ON "AuctionResult"("winningVendorId");

-- CreateIndex
CREATE INDEX "AuctionResult_winningBidId_idx" ON "AuctionResult"("winningBidId");

-- CreateIndex
CREATE INDEX "AuctionResult_status_idx" ON "AuctionResult"("status");

-- CreateIndex
CREATE UNIQUE INDEX "AuctionResult_auctionId_auctionItemId_key" ON "AuctionResult"("auctionId", "auctionItemId");

-- CreateIndex
CREATE INDEX "PaymentRecord_type_idx" ON "PaymentRecord"("type");

-- CreateIndex
CREATE INDEX "PaymentRecord_status_idx" ON "PaymentRecord"("status");

-- CreateIndex
CREATE INDEX "PaymentRecord_auctionId_idx" ON "PaymentRecord"("auctionId");

-- CreateIndex
CREATE INDEX "PaymentRecord_vendorOrganizationId_idx" ON "PaymentRecord"("vendorOrganizationId");

-- CreateIndex
CREATE INDEX "PaymentRecord_emdRecordId_idx" ON "PaymentRecord"("emdRecordId");

-- CreateIndex
CREATE INDEX "PaymentRecord_referenceIdentifier_idx" ON "PaymentRecord"("referenceIdentifier");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_type_idx" ON "Notification"("type");

-- CreateIndex
CREATE INDEX "Notification_isRead_idx" ON "Notification"("isRead");

-- CreateIndex
CREATE INDEX "Notification_relatedEntityType_relatedEntityId_idx" ON "Notification"("relatedEntityType", "relatedEntityId");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_actorUserId_idx" ON "AuditLog"("actorUserId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "UserOrganization" ADD CONSTRAINT "UserOrganization_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserOrganization" ADD CONSTRAINT "UserOrganization_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Auction" ADD CONSTRAINT "Auction_clientOrganizationId_fkey" FOREIGN KEY ("clientOrganizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Auction" ADD CONSTRAINT "Auction_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Auction" ADD CONSTRAINT "Auction_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Auction" ADD CONSTRAINT "Auction_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuctionItem" ADD CONSTRAINT "AuctionItem_auctionId_fkey" FOREIGN KEY ("auctionId") REFERENCES "Auction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuctionDocument" ADD CONSTRAINT "AuctionDocument_auctionId_fkey" FOREIGN KEY ("auctionId") REFERENCES "Auction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuctionDocument" ADD CONSTRAINT "AuctionDocument_auctionItemId_fkey" FOREIGN KEY ("auctionItemId") REFERENCES "AuctionItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuctionDocument" ADD CONSTRAINT "AuctionDocument_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuctionMedia" ADD CONSTRAINT "AuctionMedia_auctionId_fkey" FOREIGN KEY ("auctionId") REFERENCES "Auction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuctionMedia" ADD CONSTRAINT "AuctionMedia_auctionItemId_fkey" FOREIGN KEY ("auctionItemId") REFERENCES "AuctionItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorParticipation" ADD CONSTRAINT "VendorParticipation_auctionId_fkey" FOREIGN KEY ("auctionId") REFERENCES "Auction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorParticipation" ADD CONSTRAINT "VendorParticipation_vendorOrganizationId_fkey" FOREIGN KEY ("vendorOrganizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorParticipation" ADD CONSTRAINT "VendorParticipation_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmdRecord" ADD CONSTRAINT "EmdRecord_auctionId_fkey" FOREIGN KEY ("auctionId") REFERENCES "Auction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmdRecord" ADD CONSTRAINT "EmdRecord_vendorOrganizationId_fkey" FOREIGN KEY ("vendorOrganizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmdRecord" ADD CONSTRAINT "EmdRecord_participationId_fkey" FOREIGN KEY ("participationId") REFERENCES "VendorParticipation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmdRecord" ADD CONSTRAINT "EmdRecord_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bid" ADD CONSTRAINT "Bid_auctionId_fkey" FOREIGN KEY ("auctionId") REFERENCES "Auction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bid" ADD CONSTRAINT "Bid_auctionItemId_fkey" FOREIGN KEY ("auctionItemId") REFERENCES "AuctionItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bid" ADD CONSTRAINT "Bid_vendorOrganizationId_fkey" FOREIGN KEY ("vendorOrganizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuctionResult" ADD CONSTRAINT "AuctionResult_auctionId_fkey" FOREIGN KEY ("auctionId") REFERENCES "Auction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuctionResult" ADD CONSTRAINT "AuctionResult_auctionItemId_fkey" FOREIGN KEY ("auctionItemId") REFERENCES "AuctionItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuctionResult" ADD CONSTRAINT "AuctionResult_winningVendorId_fkey" FOREIGN KEY ("winningVendorId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuctionResult" ADD CONSTRAINT "AuctionResult_winningBidId_fkey" FOREIGN KEY ("winningBidId") REFERENCES "Bid"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuctionResult" ADD CONSTRAINT "AuctionResult_declaredById_fkey" FOREIGN KEY ("declaredById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentRecord" ADD CONSTRAINT "PaymentRecord_auctionId_fkey" FOREIGN KEY ("auctionId") REFERENCES "Auction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentRecord" ADD CONSTRAINT "PaymentRecord_vendorOrganizationId_fkey" FOREIGN KEY ("vendorOrganizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentRecord" ADD CONSTRAINT "PaymentRecord_emdRecordId_fkey" FOREIGN KEY ("emdRecordId") REFERENCES "EmdRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
