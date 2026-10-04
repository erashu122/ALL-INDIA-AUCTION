-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "businessCategories" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "gstNumber" TEXT,
ADD COLUMN     "panNumber" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "designation" TEXT,
ADD COLUMN     "emailVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "termsAcceptedAt" TIMESTAMP(3);
