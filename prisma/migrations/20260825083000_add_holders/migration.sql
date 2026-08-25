-- CreateTable
CREATE TABLE "holders" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "holders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "holders_name_key" ON "holders"("name");

-- AlterTable
ALTER TABLE "asset_information" ADD COLUMN "currently_issued_holder_id" TEXT;

-- AlterTable
ALTER TABLE "asset_transfer" ALTER COLUMN "to_user_id" DROP NOT NULL,
ADD COLUMN "from_holder_id" TEXT,
ADD COLUMN "to_holder_id" TEXT;

-- AddForeignKey
ALTER TABLE "holders" ADD CONSTRAINT "holders_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_information" ADD CONSTRAINT "asset_information_currently_issued_holder_id_fkey" FOREIGN KEY ("currently_issued_holder_id") REFERENCES "holders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_transfer" ADD CONSTRAINT "asset_transfer_from_holder_id_fkey" FOREIGN KEY ("from_holder_id") REFERENCES "holders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_transfer" ADD CONSTRAINT "asset_transfer_to_holder_id_fkey" FOREIGN KEY ("to_holder_id") REFERENCES "holders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
