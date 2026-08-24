-- CreateEnum
CREATE TYPE "asset_photo_kind" AS ENUM ('warranty', 'receipt');

-- CreateEnum
CREATE TYPE "asset_condition_grade" AS ENUM ('new', 'good', 'poor');

-- CreateEnum
CREATE TYPE "asset_status" AS ENUM ('active', 'inactive', 'stored');

-- AlterTable
ALTER TABLE "asset_information"
ADD COLUMN "condition_assignment" "asset_condition_grade",
ADD COLUMN "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "current_condition",
ADD COLUMN "current_condition" "asset_condition_grade",
DROP COLUMN "status",
ADD COLUMN "status" "asset_status";

-- CreateTable
CREATE TABLE "asset_photo" (
    "id" TEXT NOT NULL,
    "asset_id" TEXT NOT NULL,
    "kind" "asset_photo_kind" NOT NULL,
    "file_name" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "byte_size" INTEGER NOT NULL,
    "data" BYTEA NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "asset_photo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "asset_photo_asset_id_idx" ON "asset_photo"("asset_id");

-- CreateIndex
CREATE UNIQUE INDEX "asset_photo_asset_id_kind_key" ON "asset_photo"("asset_id", "kind");

-- CreateIndex
CREATE UNIQUE INDEX "asset_information_code_name_key" ON "asset_information"("code_name");

-- AddForeignKey
ALTER TABLE "asset_photo" ADD CONSTRAINT "asset_photo_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "asset_information"("id") ON DELETE CASCADE ON UPDATE CASCADE;
