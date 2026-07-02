/*
  Warnings:

  - You are about to drop the `_asset_informationTocategories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_asset_informationToconditions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_asset_informationTodepartments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_asset_informationTolocation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_original_issue` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `asset_information` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `conditions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `departments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `employees` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `location` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `user_id` to the `categories` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_asset_informationTocategories" DROP CONSTRAINT "_asset_informationTocategories_A_fkey";

-- DropForeignKey
ALTER TABLE "_asset_informationTocategories" DROP CONSTRAINT "_asset_informationTocategories_B_fkey";

-- DropForeignKey
ALTER TABLE "_asset_informationToconditions" DROP CONSTRAINT "_asset_informationToconditions_A_fkey";

-- DropForeignKey
ALTER TABLE "_asset_informationToconditions" DROP CONSTRAINT "_asset_informationToconditions_B_fkey";

-- DropForeignKey
ALTER TABLE "_asset_informationTodepartments" DROP CONSTRAINT "_asset_informationTodepartments_A_fkey";

-- DropForeignKey
ALTER TABLE "_asset_informationTodepartments" DROP CONSTRAINT "_asset_informationTodepartments_B_fkey";

-- DropForeignKey
ALTER TABLE "_asset_informationTolocation" DROP CONSTRAINT "_asset_informationTolocation_A_fkey";

-- DropForeignKey
ALTER TABLE "_asset_informationTolocation" DROP CONSTRAINT "_asset_informationTolocation_B_fkey";

-- DropForeignKey
ALTER TABLE "_original_issue" DROP CONSTRAINT "_original_issue_A_fkey";

-- DropForeignKey
ALTER TABLE "_original_issue" DROP CONSTRAINT "_original_issue_B_fkey";

-- DropForeignKey
ALTER TABLE "asset_information" DROP CONSTRAINT "asset_information_currently_issued_to_id_fkey";

-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "user_id" TEXT NOT NULL;

-- DropTable
DROP TABLE "_asset_informationTocategories";

-- DropTable
DROP TABLE "_asset_informationToconditions";

-- DropTable
DROP TABLE "_asset_informationTodepartments";

-- DropTable
DROP TABLE "_asset_informationTolocation";

-- DropTable
DROP TABLE "_original_issue";

-- DropTable
DROP TABLE "asset_information";

-- DropTable
DROP TABLE "conditions";

-- DropTable
DROP TABLE "departments";

-- DropTable
DROP TABLE "employees";

-- DropTable
DROP TABLE "location";

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "full_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE INDEX "categories_user_id_idx" ON "categories"("user_id");

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
