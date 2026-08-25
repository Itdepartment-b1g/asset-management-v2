-- AlterTable
ALTER TABLE "asset_transfer" ADD COLUMN "from_location_id" TEXT,
ADD COLUMN "to_location_id" TEXT;

-- AddForeignKey
ALTER TABLE "asset_transfer" ADD CONSTRAINT "asset_transfer_from_location_id_fkey" FOREIGN KEY ("from_location_id") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_transfer" ADD CONSTRAINT "asset_transfer_to_location_id_fkey" FOREIGN KEY ("to_location_id") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
