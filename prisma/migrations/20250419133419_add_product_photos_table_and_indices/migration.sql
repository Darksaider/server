/*
  Warnings:

  - You are about to drop the column `position` on the `product_photos` table. All the data in the column will be lost.
  - Added the required column `cloudinary_public_id` to the `product_photos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "product_photos" DROP COLUMN "position",
ADD COLUMN     "cloudinary_public_id" TEXT NOT NULL;
