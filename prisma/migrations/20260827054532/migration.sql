-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "user_role" ADD VALUE 'department_head';
ALTER TYPE "user_role" ADD VALUE 'head_operations';
ALTER TYPE "user_role" ADD VALUE 'operations_manager';

-- AlterTable
ALTER TABLE "user" ALTER COLUMN "id" DROP DEFAULT;
