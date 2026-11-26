-- CreateTable
CREATE TABLE IF NOT EXISTS "OrderEditLog" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "edited_by_id" TEXT NOT NULL,
    "changes" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderEditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "OrderEditLog_order_id_idx" ON "OrderEditLog"("order_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "OrderEditLog_edited_by_id_idx" ON "OrderEditLog"("edited_by_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "OrderEditLog_createdAt_idx" ON "OrderEditLog"("createdAt");

-- AddForeignKey
DO $$ BEGIN
    ALTER TABLE "OrderEditLog" ADD CONSTRAINT "OrderEditLog_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$ BEGIN
    ALTER TABLE "OrderEditLog" ADD CONSTRAINT "OrderEditLog_edited_by_id_fkey" FOREIGN KEY ("edited_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;
