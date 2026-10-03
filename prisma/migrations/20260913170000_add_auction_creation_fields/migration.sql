/*
  Warnings:

  - Added the required column `category` to the `Auction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Auction" ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "termsAndConditions" TEXT,
ADD COLUMN     "vendorRequirements" TEXT;
