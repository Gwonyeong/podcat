-- AlterTable
ALTER TABLE "podcat"."User" ADD COLUMN     "plan" TEXT NOT NULL DEFAULT 'free';

-- CreateTable
CREATE TABLE "podcat"."user_interested_categories" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_interested_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "podcat"."reserved_messages" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "reservedTime" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reserved_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_interested_categories_userId_categoryId_key" ON "podcat"."user_interested_categories"("userId", "categoryId");

-- AddForeignKey
ALTER TABLE "podcat"."user_interested_categories" ADD CONSTRAINT "user_interested_categories_userId_fkey" FOREIGN KEY ("userId") REFERENCES "podcat"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "podcat"."user_interested_categories" ADD CONSTRAINT "user_interested_categories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "podcat"."categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "podcat"."reserved_messages" ADD CONSTRAINT "reserved_messages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "podcat"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
