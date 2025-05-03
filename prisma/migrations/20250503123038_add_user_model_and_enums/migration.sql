/*
  Warnings:

  - The `status` column on the `UserBook` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[userId]` on the table `Wallet` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `actionType` on the `BookAction` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `type` on the `UserBook` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `userId` to the `Wallet` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type` on the `WalletMovement` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "BookActionType" AS ENUM ('BORROW', 'RETURN', 'BUY', 'RESTOCK', 'RESTOCK_COMPLETED');

-- CreateEnum
CREATE TYPE "UserBookType" AS ENUM ('BORROWED', 'BOUGHT');

-- CreateEnum
CREATE TYPE "UserBookStatus" AS ENUM ('ACTIVE', 'RETURNED');

-- CreateEnum
CREATE TYPE "WalletMovementType" AS ENUM ('CREDIT', 'DEBIT');

-- AlterTable
ALTER TABLE "BookAction" DROP COLUMN "actionType",
ADD COLUMN     "actionType" "BookActionType" NOT NULL;

-- AlterTable
ALTER TABLE "UserBook" DROP COLUMN "type",
ADD COLUMN     "type" "UserBookType" NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "UserBookStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "Wallet" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "WalletMovement" DROP COLUMN "type",
ADD COLUMN     "type" "WalletMovementType" NOT NULL;

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_userId_key" ON "Wallet"("userId");

-- AddForeignKey
ALTER TABLE "BookAction" ADD CONSTRAINT "BookAction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBook" ADD CONSTRAINT "UserBook_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
