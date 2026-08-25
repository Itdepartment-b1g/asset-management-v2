-- DropIndex
DROP INDEX "asset_information_condition_assignment_id_idx";

-- DropIndex
DROP INDEX "asset_information_current_condition_id_idx";

-- DropIndex
DROP INDEX "asset_information_department_id_idx";

-- DropIndex
DROP INDEX "asset_information_legend_id_idx";

-- DropIndex
DROP INDEX "asset_information_location_id_idx";

-- AlterTable
ALTER TABLE "asset_information" ALTER COLUMN "updated_at" DROP DEFAULT;

-- DropEnum
DROP TYPE "asset_condition_grade";
