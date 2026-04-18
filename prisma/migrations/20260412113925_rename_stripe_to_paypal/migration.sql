/*
  Warnings:

  - You are about to drop the column `stripePaymentId` on the `Order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "stripePaymentId",
ADD COLUMN     "paymentId" TEXT;
