-- AlterTable
ALTER TABLE "asset_information" ADD COLUMN     "created_by_id" TEXT;

-- AlterTable
ALTER TABLE "conditions" ADD COLUMN     "created_by_id" TEXT;

-- AlterTable
ALTER TABLE "departments" ADD COLUMN     "created_by_id" TEXT;

-- AlterTable
ALTER TABLE "legend" ADD COLUMN     "created_by_id" TEXT;

-- AlterTable
ALTER TABLE "locations" ADD COLUMN     "created_by_id" TEXT;

-- AddForeignKey
ALTER TABLE "asset_information" ADD CONSTRAINT "asset_information_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "locations" ADD CONSTRAINT "locations_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conditions" ADD CONSTRAINT "conditions_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "legend" ADD CONSTRAINT "legend_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
