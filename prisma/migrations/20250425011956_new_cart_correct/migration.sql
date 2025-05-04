/*
  Warnings:

  - You are about to drop the column `product_color_id` on the `cart` table. All the data in the column will be lost.
  - You are about to drop the column `product_size_id` on the `cart` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id,product_id,size_id,color_id]` on the table `cart` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `color_id` to the `cart` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size_id` to the `cart` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "cart" DROP CONSTRAINT "cart_product_color_id_fkey";

-- DropForeignKey
ALTER TABLE "cart" DROP CONSTRAINT "cart_product_size_id_fkey";

-- DropIndex
DROP INDEX "cart_user_id_product_id_product_size_id_product_color_id_key";

-- AlterTable
ALTER TABLE "cart" DROP COLUMN "product_color_id",
DROP COLUMN "product_size_id",
ADD COLUMN     "color_id" INTEGER NOT NULL,
ADD COLUMN     "size_id" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "cart_user_id_product_id_size_id_color_id_key" ON "cart"("user_id", "product_id", "size_id", "color_id");

-- CreateIndex
CREATE INDEX "sizes_size_idx" ON "sizes"("size");

-- AddForeignKey
ALTER TABLE "cart" ADD CONSTRAINT "cart_size_id_fkey" FOREIGN KEY ("size_id") REFERENCES "sizes"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cart" ADD CONSTRAINT "cart_color_id_fkey" FOREIGN KEY ("color_id") REFERENCES "colors"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;
