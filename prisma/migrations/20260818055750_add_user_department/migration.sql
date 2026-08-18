-- AlterTable
ALTER TABLE "user" ADD COLUMN     "department_id" TEXT;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
