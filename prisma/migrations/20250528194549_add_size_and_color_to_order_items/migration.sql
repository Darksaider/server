/*
  Warnings:

  - A unique constraint covering the columns `[order_id,product_id,color_id,size_id]` on the table `order_items` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `color_id` to the `order_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size_id` to the `order_items` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "order_items" ADD COLUMN     "color_id" INTEGER NOT NULL,
ADD COLUMN     "size_id" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "order_items_order_id_product_id_color_id_size_id_key" ON "order_items"("order_id", "product_id", "color_id", "size_id");

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_color_id_fkey" FOREIGN KEY ("color_id") REFERENCES "colors"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_size_id_fkey" FOREIGN KEY ("size_id") REFERENCES "sizes"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;
