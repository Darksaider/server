/*
  Warnings:

  - A unique constraint covering the columns `[user_id,product_id,product_size_id,product_color_id]` on the table `cart` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `product_color_id` to the `cart` table without a default value. This is not possible if the table is not empty.
  - Added the required column `product_size_id` to the `cart` table without a default value. This is not possible if the table is not empty.
  - Made the column `quantity` on table `cart` required. This step will fail if there are existing NULL values in that column.
  - Made the column `added_at` on table `cart` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "cart_user_id_product_id_key";

-- AlterTable
ALTER TABLE "cart" ADD COLUMN     "product_color_id" INTEGER NOT NULL,
ADD COLUMN     "product_size_id" INTEGER NOT NULL,
ALTER COLUMN "quantity" SET NOT NULL,
ALTER COLUMN "added_at" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "cart_user_id_product_id_product_size_id_product_color_id_key" ON "cart"("user_id", "product_id", "product_size_id", "product_color_id");

-- AddForeignKey
ALTER TABLE "cart" ADD CONSTRAINT "cart_product_size_id_fkey" FOREIGN KEY ("product_size_id") REFERENCES "product_sizes"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cart" ADD CONSTRAINT "cart_product_color_id_fkey" FOREIGN KEY ("product_color_id") REFERENCES "product_colors"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;
