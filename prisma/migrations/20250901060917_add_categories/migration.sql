/*
  Warnings:

  - You are about to drop the column `category` on the `audios` table. All the data in the column will be lost.
  - Added the required column `categoryId` to the `audios` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "audios" DROP COLUMN "category",
ADD COLUMN     "categoryId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "categories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- AddForeignKey
ALTER TABLE "audios" ADD CONSTRAINT "audios_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES ""categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
