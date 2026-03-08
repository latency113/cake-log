/*
  Warnings:

  - You are about to drop the column `book_number` on the `Order` table. All the data in the column will be lost.
  - Made the column `book_id` on table `Order` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."Order" DROP CONSTRAINT "Order_book_id_fkey";

-- AlterTable
ALTER TABLE "public"."Order" DROP COLUMN "book_number",
ALTER COLUMN "book_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "public"."OrderBook"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
