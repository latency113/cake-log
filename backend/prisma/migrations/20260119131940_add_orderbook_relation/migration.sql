-- DropForeignKey
ALTER TABLE "public"."Order" DROP CONSTRAINT "Order_book_id_fkey";

-- AlterTable
ALTER TABLE "public"."Order" ADD COLUMN     "book_number" TEXT,
ALTER COLUMN "book_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "public"."OrderBook"("id") ON DELETE SET NULL ON UPDATE CASCADE;
