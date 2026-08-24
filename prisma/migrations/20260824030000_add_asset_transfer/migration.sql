-- CreateTable
CREATE TABLE "asset_transfer" (
    "id" TEXT NOT NULL,
    "asset_id" TEXT NOT NULL,
    "from_user_id" TEXT,
    "to_user_id" TEXT NOT NULL,
    "remarks" TEXT,
    "transferred_by_id" TEXT NOT NULL,
    "transferred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "asset_transfer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "asset_transfer_asset_id_transferred_at_idx" ON "asset_transfer"("asset_id", "transferred_at");

-- AddForeignKey
ALTER TABLE "asset_transfer" ADD CONSTRAINT "asset_transfer_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "asset_information"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_transfer" ADD CONSTRAINT "asset_transfer_from_user_id_fkey" FOREIGN KEY ("from_user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_transfer" ADD CONSTRAINT "asset_transfer_to_user_id_fkey" FOREIGN KEY ("to_user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_transfer" ADD CONSTRAINT "asset_transfer_transferred_by_id_fkey" FOREIGN KEY ("transferred_by_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
