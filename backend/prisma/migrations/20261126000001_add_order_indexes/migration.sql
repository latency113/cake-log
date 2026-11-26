-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_order_user_id" ON "Order"("user_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_order_status" ON "Order"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_order_pickup_date" ON "Order"("pickup_date");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_order_item_order_id" ON "OrderItem"("order_id");
