/*
  Warnings:

  - A unique constraint covering the columns `[phoneNumber]` on the table `user_applications` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "user_applications_phoneNumber_key" ON "podcat"."user_applications"("phoneNumber");
