/*
  Warnings:

  - You are about to drop the column `subscriptionCanceled` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `subscriptionEndDate` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `payment_histories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `payments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `subscriptions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "podcat"."payment_histories" DROP CONSTRAINT "payment_histories_paymentId_fkey";

-- DropForeignKey
ALTER TABLE "podcat"."payment_histories" DROP CONSTRAINT "payment_histories_userId_fkey";

-- DropForeignKey
ALTER TABLE "podcat"."payments" DROP CONSTRAINT "payments_subscriptionId_fkey";

-- DropForeignKey
ALTER TABLE "podcat"."payments" DROP CONSTRAINT "payments_userId_fkey";

-- DropForeignKey
ALTER TABLE "podcat"."subscriptions" DROP CONSTRAINT "subscriptions_userId_fkey";

-- AlterTable
ALTER TABLE "podcat"."User" DROP COLUMN "subscriptionCanceled",
DROP COLUMN "subscriptionEndDate";

-- DropTable
DROP TABLE "podcat"."payment_histories";

-- DropTable
DROP TABLE "podcat"."payments";

-- DropTable
DROP TABLE "podcat"."subscriptions";
