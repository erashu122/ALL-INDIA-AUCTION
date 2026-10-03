/*
  Warnings:

  - Added the required column `uploadedById` to the `AuctionMedia` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "FileAccess" AS ENUM ('PUBLIC', 'PRIVATE', 'INTERNAL');

-- AlterTable
ALTER TABLE "AuctionDocument" ADD COLUMN     "access" "FileAccess" NOT NULL DEFAULT 'PRIVATE';

-- AlterTable
ALTER TABLE "AuctionMedia" ADD COLUMN     "access" "FileAccess" NOT NULL DEFAULT 'PRIVATE',
ADD COLUMN     "uploadedById" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "AuctionDocument_auctionId_access_idx" ON "AuctionDocument"("auctionId", "access");

-- CreateIndex
CREATE INDEX "AuctionMedia_auctionId_access_idx" ON "AuctionMedia"("auctionId", "access");

-- CreateIndex
CREATE INDEX "AuctionMedia_uploadedById_idx" ON "AuctionMedia"("uploadedById");

-- AddForeignKey
ALTER TABLE "AuctionMedia" ADD CONSTRAINT "AuctionMedia_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
